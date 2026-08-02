/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * @module import/service/release/DefaultDataReleaseService
 * @description Discovers immutable module-owned init, core, and sample releases, validates installation plans, and invokes the existing nImport execution authority.
 * @layer service
 * @owner import
 * @override Projects may extend release policy or installation persistence while preserving manifest integrity, active-module ownership, tenant isolation, and nImport execution.
 */
module.exports = {
    activeExecutions: new Map(),

    /** Initializes data-release discovery. */
    init: function () { return Promise.resolve(true); },
    /** Completes data-release service initialization. */
    postInit: function () { return Promise.resolve(true); },

    /** Returns the client-safe release catalogue for the active runtime and tenant. */
    getCatalogue: async function (request) {
        let tenant = this.resolveTenant(request);
        let releases = this.discoverReleases(request && request.dataType);
        let installations = await this.getInstallations(tenant);
        let byCode = Object.fromEntries(installations.map(item => [item.code, item]));
        return {
            code: 'SUC_IMP_00000',
            data: releases.map(release => this.toCatalogueItem(release,
                byCode[this.installationCode(tenant, release)],
                this.activeExecutions.has(tenant + ':' + release.dataType)))
        };
    },

    /** Validates a requested immutable plan without executing import handlers or persisting imported business data. */
    preflight: async function (request) {
        let plan = await this.preparePlan(request);
        let operationReleases = await this.operationReleases(plan, 'AVAILABLE');
        let executablePlan = this.executablePlan(plan, operationReleases);
        let validation = {
            validationOnly: true,
            importExecuted: false,
            skipped: executablePlan.releases.length === 0,
            reason: executablePlan.releases.length === 0 ?
                'Selected data releases are already current' :
                'Data release plan validated; no import execution was performed'
        };
        return {
            code: 'SUC_IMP_00000',
            data: {
                dataType: plan.dataType,
                tenant: plan.tenant,
                releases: operationReleases,
                validation: validation
            }
        };
    },

    /** Executes one validated plan through the authoritative init/core/sample service operation. */
    execute: async function (request) {
        let plan = await this.preparePlan(request);
        let operationReleases = await this.operationReleases(plan, 'AVAILABLE');
        plan = this.executablePlan(plan, operationReleases);
        if (plan.releases.length === 0) throw this.error('ERR_IMP_00003', 'Selected data releases are already current');
        let typePolicy = (this.configuration().types || {})[plan.dataType] || {};
        if (typePolicy.operatorExecution !== true) throw this.error('ERR_IMP_00002', 'Operator execution is disabled for this data release type');
        let executionKey = plan.tenant + ':' + plan.dataType;
        if (this.activeExecutions.has(executionKey)) throw this.error('ERR_IMP_00003', 'A data release import is already running');
        this.activeExecutions.set(executionKey, true);
        await Promise.all(plan.releases.map(release => this.recordInstallation(plan, release, undefined, 'RUNNING')));
        try {
            let importRequest = this.createImportRequest(request, plan, false);
            let result = await this.invokeImport(importRequest, plan.dataType);
            await Promise.all(plan.releases.map(release => this.recordInstallation(plan, release, importRequest.importRun, 'CURRENT')));
            let operationReleases = plan.releases.map(release => this.operationRelease(release, 'CURRENT'));
            return {
                code: 'SUC_IMP_00000',
                data: {
                    dataType: plan.dataType,
                    tenant: plan.tenant,
                    releases: operationReleases,
                    importRun: importRequest.importRun,
                    result: result
                }
            };
        } catch (error) {
            await Promise.all(plan.releases.map(release => this.recordInstallation(plan, release, undefined, 'FAILED')))
                .catch(() => false);
            throw error;
        } finally {
            this.activeExecutions.delete(executionKey);
        }
    },

    /** Resolves and validates the requested active-module release plan. */
    preparePlan: async function (request) {
        let body = request && request.releaseRequest || {};
        let dataType = String(body.dataType || '').toLowerCase();
        this.validateDataType(dataType);
        this.validateTypePolicy(dataType);
        let available = this.discoverReleases(dataType);
        let requestedModules = Array.isArray(body.modules) && body.modules.length > 0 ? body.modules : available.map(item => item.moduleName);
        if (requestedModules.length > Number(this.configuration().maximumModulesPerRun || 256) ||
            new Set(requestedModules).size !== requestedModules.length ||
            requestedModules.some(moduleName => !/^[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(moduleName))) {
            throw this.error('ERR_IMP_00003', 'Requested data release modules are invalid');
        }
        let availableByModule = Object.fromEntries(available.map(item => [item.moduleName, item]));
        let releases = requestedModules.map(moduleName => {
            if (!availableByModule[moduleName]) throw this.error('ERR_IMP_00004', 'Requested module data release is unavailable');
            return availableByModule[moduleName];
        });
        if (releases.some(release => release.invalidManifest === true)) {
            throw this.error('ERR_IMP_00003', 'Requested data release manifest is invalid; repair manifest before installation');
        }
        let expected = body.expectedReleases || {};
        releases.forEach(release => {
            if (expected[release.moduleName] && expected[release.moduleName] !== release.version) {
                throw this.error('ERR_IMP_00003', 'Data release changed after selection; refresh and validate again');
            }
        });
        let tenant = this.resolveTenant(request);
        let installations = await this.getInstallations(tenant);
        let installedByCode = Object.fromEntries(installations.map(item => [item.code, item]));
        releases.forEach(release => this.validateUpgradePolicy(release, installedByCode[this.installationCode(tenant, release)]));
        return { dataType: dataType, tenant: tenant, releases: releases };
    },

    /** Projects operation responses using the same client-safe release contract as the catalogue. */
    operationReleases: async function (plan, mode) {
        if (mode === 'CURRENT') return plan.releases.map(release => this.operationRelease(release, 'CURRENT'));
        let installations = await this.getInstallations(plan.tenant);
        let byCode = Object.fromEntries(installations.map(item => [item.code, item]));
        return plan.releases.map(release => this.toCatalogueItem(release,
            byCode[this.installationCode(plan.tenant, release)],
            this.activeExecutions.has(plan.tenant + ':' + release.dataType)));
    },

    /** Adds mandatory operation status fields without exposing internal paths or executable data. */
    operationRelease: function (release, status) {
        return Object.assign(this.publicRelease(release), {
            installedVersion: status === 'CURRENT' ? release.version : undefined,
            status: status
        });
    },

    /** Keeps execution scoped to releases that can change state. */
    executablePlan: function (plan, operationReleases) {
        let executableModules = new Set((operationReleases || [])
            .filter(release => ['NOT_INSTALLED', 'UPDATE_AVAILABLE', 'FAILED'].includes(release.status))
            .map(release => release.moduleName));
        return Object.assign({}, plan, {
            releases: plan.releases.filter(release => executableModules.has(release.moduleName))
        });
    },

    /** Discovers only active loader-owned module data releases. */
    discoverReleases: function (requestedType) {
        if (requestedType) this.validateDataType(requestedType);
        let releases = [];
        (NODICS.getActiveModules() || []).forEach(moduleName => {
            let rawModule = NODICS.getRawModule(moduleName);
            if (!rawModule || !rawModule.path) return;
            ['init', 'core', 'sample'].filter(type => !requestedType || requestedType === type).forEach(dataType => {
                let manifestPath = path.join(rawModule.path, 'data', dataType, 'manifest.json');
                if (!fs.existsSync(manifestPath)) return;
                try {
                    releases.push(this.inspectManifest(rawModule, dataType, manifestPath));
                } catch (error) {
                    releases.push(this.invalidManifestRelease(rawModule, dataType, manifestPath, error));
                }
            });
        });
        return releases.sort((first, second) =>
            first.dataType.localeCompare(second.dataType) || first.moduleName.localeCompare(second.moduleName));
    },

    /** Validates one manifest, containment, symlink policy, and every declared checksum. */
    inspectManifest: function (rawModule, dataType, manifestPath) {
        let releaseRoot = path.dirname(manifestPath);
        let manifest;
        try {
            manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        } catch (error) {
            throw this.error('ERR_IMP_00003', 'Data release manifest is invalid');
        }
        if (!manifest || !(this.configuration().allowedContractVersions || [1]).includes(manifest.contractVersion) ||
            manifest.module !== rawModule.name ||
            manifest.dataType !== dataType || !/^\d+\.\d+\.\d+$/.test(manifest.version || '') ||
            !manifest.files || typeof manifest.files !== 'object' || Array.isArray(manifest.files)) {
            throw this.error('ERR_IMP_00003', 'Data release manifest is incompatible');
        }
        let fileNames = Object.keys(manifest.files).sort();
        if (fileNames.length === 0 || fileNames.length > Number(this.configuration().maximumFilesPerRelease || 1024)) {
            throw this.error('ERR_IMP_00003', 'Data release file count is invalid');
        }
        fileNames.forEach(relativeFile => {
            if (path.isAbsolute(relativeFile) || relativeFile.includes('..')) throw this.error('ERR_IMP_00003', 'Data release path is invalid');
            let filePath = path.resolve(releaseRoot, relativeFile);
            if (!filePath.startsWith(releaseRoot + path.sep) || !fs.existsSync(filePath) ||
                fs.lstatSync(filePath).isSymbolicLink() || !fs.statSync(filePath).isFile()) {
                throw this.error('ERR_IMP_00003', 'Data release file is unavailable');
            }
            let checksum = crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
            if (checksum !== manifest.files[relativeFile]) throw this.error('ERR_IMP_00003', 'Data release checksum validation failed');
        });
        let checksum = crypto.createHash('sha256').update(fileNames.map(file => file + ':' + manifest.files[file]).join('|')).digest('hex');
        return {
            moduleName: rawModule.name,
            displayName: rawModule.metaData && rawModule.metaData.nodics && rawModule.metaData.nodics.displayName || rawModule.name,
            parentModule: rawModule.parent,
            canonicalIdentity: rawModule.canonicalIdentity || rawModule.name,
            dataType: dataType,
            version: manifest.version,
            description: String(manifest.description || ''),
            checksum: checksum
        };
    },

    /** Projects a bad manifest as a visible but non-executable release. */
    invalidManifestRelease: function (rawModule, dataType, manifestPath, error) {
        let manifest = {};
        try {
            manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        } catch (ignored) {
            manifest = {};
        }
        return {
            moduleName: rawModule.name,
            displayName: rawModule.metaData && rawModule.metaData.nodics && rawModule.metaData.nodics.displayName || rawModule.name,
            parentModule: rawModule.parent,
            canonicalIdentity: rawModule.canonicalIdentity || rawModule.name,
            dataType: dataType,
            version: /^\d+\.\d+\.\d+$/.test(manifest.version || '') ? manifest.version : '0.0.0',
            description: 'This data release manifest is invalid and must be repaired before it can be validated or installed.',
            checksum: 'invalid-release',
            invalidManifest: true,
            invalidReason: error && error.message || 'Data release manifest is invalid'
        };
    },

    /** Builds the existing nImport request without exposing filesystem paths. */
    createImportRequest: function (request, plan, validationOnly) {
        let next = Object.assign({}, request, {
            tenant: plan.tenant,
            modules: plan.releases.map(release => release.moduleName),
            options: Object.assign({}, request && request.options, { validateOnly: validationOnly }),
            dataReleasePlan: plan.releases.map(release => this.publicRelease(release))
        });
        return next;
    },

    /** Invokes the authoritative Init, Core, or Sample import operation. */
    invokeImport: function (request, dataType) {
        let operation = { init: 'importInitData', core: 'importCoreData', sample: 'importSampleData' }[dataType];
        return SERVICE.DefaultImportService[operation](request);
    },

    /** Returns durable current installation projections for one tenant. */
    getInstallations: function (tenant) {
        let installationService = SERVICE.DefaultDataInstallationService;
        if (!installationService || typeof installationService.get !== 'function') return Promise.resolve([]);
        return installationService.get({ tenant: tenant, query: {}, searchOptions: { limit: 1000 } })
            .then(result => result && result.result || []);
    },

    /** Records RUNNING, CURRENT, or FAILED state through the generated model service. */
    recordInstallation: async function (plan, release, importRun, status) {
        let service = SERVICE.DefaultDataInstallationService;
        if (!service) return false;
        let code = this.installationCode(plan.tenant, release);
        let existing = await service.get({ tenant: plan.tenant, query: { code: code }, searchOptions: { limit: 1 } })
            .then(result => result && result.result && result.result[0]).catch(() => undefined);
        let model = {
            code: code, active: true, tenant: plan.tenant,
            environment: NODICS.getSelectedEnvironmentName(), moduleName: release.moduleName,
            dataType: release.dataType,
            version: status === 'CURRENT' ? release.version : existing && existing.version,
            checksum: status === 'CURRENT' ? release.checksum : existing && existing.checksum,
            availableVersion: release.version, availableChecksum: release.checksum,
            runId: importRun && importRun.runId || existing && existing.runId,
            status: status,
            installedAt: status === 'CURRENT' ? new Date().toISOString() : existing && existing.installedAt,
            lastAttemptAt: new Date().toISOString()
        };
        if (existing && typeof service.update === 'function') {
            return service.update({ tenant: plan.tenant, query: { code: code }, model: model });
        }
        return service.save({ tenant: plan.tenant, model: model });
    },

    /** Combines available and installed state into a client-safe catalogue item. */
    toCatalogueItem: function (release, installed, running) {
        if (release.invalidManifest === true) {
            return Object.assign(this.publicRelease(release), {
                installedVersion: installed && installed.version,
                installedChecksum: installed && installed.checksum,
                lastRunId: installed && installed.runId,
                installedAt: installed && installed.installedAt,
                lastAttemptAt: installed && installed.lastAttemptAt,
                status: 'INVALID_RELEASE'
            });
        }
        let status = 'NOT_INSTALLED';
        if (installed) {
            let comparison = this.compareVersions(release.version, installed.version);
            status = comparison > 0 ? 'UPDATE_AVAILABLE' :
                comparison < 0 ? 'DOWNGRADE_AVAILABLE' :
                    release.checksum === installed.checksum ? 'CURRENT' : 'INVALID_RELEASE';
            if (installed.status === 'FAILED') status = 'FAILED';
        }
        if (running || installed && installed.status === 'RUNNING') status = 'RUNNING';
        return Object.assign(this.publicRelease(release), {
            installedVersion: installed && installed.version,
            installedChecksum: installed && installed.checksum,
            lastRunId: installed && installed.runId,
            installedAt: installed && installed.installedAt,
            lastAttemptAt: installed && installed.lastAttemptAt,
            status: status
        });
    },

    /** Enforces downgrade and same-version checksum policy. */
    validateUpgradePolicy: function (release, installed) {
        if (!installed) return true;
        let comparison = this.compareVersions(release.version, installed.version);
        if (comparison < 0 && this.configuration().allowDowngrade !== true) {
            throw this.error('ERR_IMP_00003', 'Data release downgrade is not allowed');
        }
        if (comparison === 0 && release.checksum !== installed.checksum) {
            throw this.error('ERR_IMP_00003', 'Data release content changed without a version change');
        }
        return true;
    },

    /** Rejects unsupported release types. */
    validateDataType: function (dataType) {
        if (!['init', 'core', 'sample'].includes(dataType)) throw this.error('ERR_IMP_00003', 'Data release type is invalid');
    },

    /** Enforces layered enablement for a release type. */
    validateTypePolicy: function (dataType) {
        let typePolicy = (this.configuration().types || {})[dataType] || {};
        if (typePolicy.enabled === false) throw this.error('ERR_IMP_00002', 'Data release type is disabled');
    },

    /** Returns effective layered data-release configuration. */
    configuration: function () {
        return (CONFIG.get('data') && CONFIG.get('data').dataReleases) || {};
    },

    /** Creates the stable environment, tenant, module, and type projection key. */
    installationCode: function (tenant, release) {
        return [NODICS.getSelectedEnvironmentName(), tenant, release.moduleName, release.dataType].join(':');
    },

    /** Projects release metadata without paths or executable content. */
    publicRelease: function (release) {
        return {
            moduleName: release.moduleName, displayName: release.displayName,
            parentModule: release.parentModule, canonicalIdentity: release.canonicalIdentity,
            dataType: release.dataType, version: release.version,
            description: release.description, checksum: release.checksum,
            invalidReason: release.invalidReason
        };
    },

    /** Resolves trusted tenant context with the established default fallback. */
    resolveTenant: function (request) {
        return request && request.tenant || CONFIG.get('defaultTenant') || 'default';
    },

    /** Compares strict three-part numeric release versions. */
    compareVersions: function (first, second) {
        let a = String(first || '0.0.0').split('.').map(Number);
        let b = String(second || '0.0.0').split('.').map(Number);
        for (let index = 0; index < 3; index++) {
            if (a[index] !== b[index]) return a[index] > b[index] ? 1 : -1;
        }
        return 0;
    },

    /** Creates a stable Nodics error without leaking internal details. */
    error: function (code, message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.NodicsError) return new CLASSES.NodicsError(code, message);
        let error = new Error(message);
        error.code = code;
        return error;
    }
};
