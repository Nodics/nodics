/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('crypto');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

/**
 * @module import/service/contentPack/DefaultContentPackService
 * @description Validates configured immutable content-pack releases, reports
 * tenant-scoped installation state, and dispatches staged releases through the
 * existing local import authority.
 * @layer service
 * @owner import
 * @override Later project or environment modules may override source
 * resolution, release policy, staging, or distributed locking while preserving
 * manifest validation, tenant authorization, import history, and nImport
 * execution.
 */
module.exports = {
    activeImports: new Map(),
    recentCompletions: new Map(),

    /** Initializes content-pack state. */
    init: function () {
        return Promise.resolve(true);
    },

    /** Completes content-pack service initialization. */
    postInit: function () {
        return Promise.resolve(true);
    },

    /**
     * Returns a client-safe installation and update state for one configured
     * content pack.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Status response.
     */
    getStatus: function (request) {
        let packCode = this.resolvePackCode(request);
        let context;
        try {
            context = this.resolvePackContext(packCode);
        } catch (error) {
            return Promise.reject(error);
        }
        let tenant = this.resolveTenant(request);
        let activeKey = this.createTenantPackKey(tenant, packCode);
        let activeRun = this.activeImports.get(activeKey);
        let availableRelease = this.inspectRelease(context);
        return this.findInstalledRelease(tenant, packCode).then(installedRelease => {
            installedRelease = installedRelease || this.recentCompletions.get(activeKey);
            return {
                code: 'SUC_IMP_00000',
                data: this.buildStatusData(context, availableRelease, installedRelease, activeRun)
            };
        });
    },

    /**
     * Imports or updates one configured content pack through DefaultImportService.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Completed import result and current status.
     */
    importPack: function (request) {
        let packCode = this.resolvePackCode(request);
        let context = this.resolvePackContext(packCode);
        if (!context.enabled) {
            return Promise.reject(this.createError('ERR_IMP_00002', 'Content-pack import is disabled'));
        }
        let tenant = this.resolveTenant(request);
        let activeKey = this.createTenantPackKey(tenant, packCode);
        if (this.activeImports.has(activeKey)) {
            return Promise.reject(this.createError('ERR_IMP_00003', 'Content-pack import is already running'));
        }
        let release = this.inspectRelease(context);
        if (!release.available) {
            return Promise.reject(this.createError('ERR_IMP_00004', 'Configured content-pack release is unavailable'));
        }
        return this.findInstalledRelease(tenant, packCode).then(installedRelease => {
            this.validateUpdatePolicy(context, release, installedRelease);
            if (installedRelease &&
                installedRelease.contentPackVersion === release.version &&
                installedRelease.contentPackChecksum === release.checksum) {
                return {
                    code: 'SUC_IMP_00000',
                    data: this.buildStatusData(context, release, installedRelease)
                };
            }
            let runId = this.createRunId(packCode);
            let staging = this.prepareStaging(context, release, runId);
            let importRun = {
                runId: runId,
                code: runId,
                status: 'RUNNING',
                dataType: 'local',
                tenant: tenant,
                modules: [],
                startedAt: new Date().toISOString(),
                contentPackCode: packCode,
                contentPackVersion: release.version,
                contentPackContractVersion: release.contractVersion,
                contentPackChecksum: release.checksum,
                sourceName: context.source.type
            };
            this.activeImports.set(activeKey, {
                runId: runId,
                version: release.version,
                startedAt: importRun.startedAt
            });
            let importRequest = Object.assign({}, request, {
                tenant: tenant,
                dataType: 'local',
                importFinalizeData: true,
                inputPath: {
                    rootPath: staging.inputPath
                },
                outputPath: {
                    rootPath: staging.outputPath
                },
                importRun: importRun
            });
            return SERVICE.DefaultImportService.importLocalData(importRequest).then(result => {
                let completion = {
                    runId: runId,
                    status: 'COMPLETED',
                    contentPackCode: packCode,
                    contentPackVersion: release.version,
                    contentPackContractVersion: release.contractVersion,
                    contentPackChecksum: release.checksum,
                    finishedAt: new Date().toISOString()
                };
                this.recentCompletions.set(activeKey, completion);
                return {
                    code: 'SUC_IMP_00000',
                    data: this.buildStatusData(context, release, completion),
                    import: result
                };
            }).catch(error => {
                importRun.status = 'FAILED';
                throw error;
            }).finally(() => {
                this.activeImports.delete(activeKey);
                if (context.configuration.cleanupStaging !== false) {
                    return fse.remove(staging.rootPath).catch(error => {
                        if (this.LOG && typeof this.LOG.error === 'function') {
                            this.LOG.error(
                                'Content-pack staging cleanup failed for run: ' + runId,
                                error
                            );
                        }
                    });
                }
            });
        });
    },

    /** Resolves effective configured source and policy for a pack. */
    resolvePackContext: function (packCode) {
        let data = CONFIG.get('data') || {};
        let configuration = data.contentPacks || {};
        let pack = configuration.packs && configuration.packs[packCode];
        if (!pack) {
            throw this.createError('ERR_IMP_00004', 'Content pack is not configured');
        }
        return {
            code: packCode,
            enabled: configuration.enabled === true && pack.enabled !== false,
            configuration: configuration,
            pack: pack,
            source: pack.source || {}
        };
    },

    /** Inspects and validates the available immutable pack release. */
    inspectRelease: function (context) {
        if (!context.enabled) {
            return { available: false };
        }
        try {
            let repositoryPath = this.resolveRepositoryPath(context.source);
            let manifestPath = this.resolveContainedPath(repositoryPath, context.source.manifestPath, 'manifest');
            let contentPath = this.resolveContainedPath(repositoryPath, context.source.contentPath, 'content');
            if (!fs.existsSync(manifestPath) || !fs.existsSync(contentPath)) {
                return { available: false };
            }
            let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            this.validateManifest(context, manifest, repositoryPath);
            let checksum = this.createReleaseChecksum(manifest.generatedHashes);
            if (manifest.releaseChecksum && manifest.releaseChecksum !== checksum) {
                throw this.createError('ERR_IMP_00003', 'Content-pack release checksum validation failed');
            }
            return {
                available: true,
                version: manifest.version,
                contractVersion: manifest.contractVersion,
                checksum: checksum,
                contentPath: contentPath,
                manifest: manifest
            };
        } catch (error) {
            if (error && error.code && String(error.code).startsWith('ERR_IMP_')) throw error;
            throw this.createError('ERR_IMP_00003', 'Configured content-pack release is invalid');
        }
    },

    /** Resolves a bounded configured sibling repository path. */
    resolveRepositoryPath: function (source) {
        if (source.type !== 'LOCAL_SIBLING') {
            throw this.createError('ERR_IMP_00003', 'Content-pack source type is unsupported');
        }
        let repositoryName = source.repositoryName;
        if (!/^[A-Za-z0-9._-]+$/.test(repositoryName || '')) {
            throw this.createError('ERR_IMP_00003', 'Content-pack repository name is invalid');
        }
        let nodicsHome = path.resolve(NODICS.getNodicsHome());
        let parentPath = path.dirname(nodicsHome);
        let repositoryPath = path.resolve(parentPath, repositoryName);
        if (path.dirname(repositoryPath) !== parentPath) {
            throw this.createError('ERR_IMP_00003', 'Content-pack repository escapes the configured workspace');
        }
        return repositoryPath;
    },

    /** Resolves a contained source path without traversal. */
    resolveContainedPath: function (rootPath, relativePath, label) {
        if (!relativePath || path.isAbsolute(relativePath)) {
            throw this.createError('ERR_IMP_00003', 'Content-pack ' + label + ' path is invalid');
        }
        let resolved = path.resolve(rootPath, relativePath);
        if (resolved !== rootPath && !resolved.startsWith(rootPath + path.sep)) {
            throw this.createError('ERR_IMP_00003', 'Content-pack ' + label + ' path escapes its repository');
        }
        return resolved;
    },

    /** Validates manifest identity, contract, files, and hashes. */
    validateManifest: function (context, manifest, repositoryPath) {
        let allowedVersions = context.configuration.allowedContractVersions || [1];
        if (manifest.pack !== context.pack.manifestPack ||
            typeof manifest.version !== 'string' ||
            !allowedVersions.includes(manifest.contractVersion) ||
            !manifest.generatedHashes ||
            typeof manifest.generatedHashes !== 'object') {
            throw this.createError('ERR_IMP_00003', 'Content-pack manifest is incompatible');
        }
        Object.keys(manifest.generatedHashes).forEach(relativeFile => {
            let filePath = this.resolveContainedPath(repositoryPath, relativeFile, 'generated file');
            if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
                throw this.createError('ERR_IMP_00003', 'Content-pack generated file is missing');
            }
            let actual = crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
            if (actual !== manifest.generatedHashes[relativeFile]) {
                throw this.createError('ERR_IMP_00003', 'Content-pack checksum validation failed');
            }
        });
    },

    /** Creates the deterministic aggregate release checksum. */
    createReleaseChecksum: function (generatedHashes) {
        let value = Object.keys(generatedHashes).sort()
            .map(fileName => fileName + ':' + generatedHashes[fileName]).join('|');
        return crypto.createHash('sha256').update(value).digest('hex');
    },

    /** Copies a validated immutable release into server-owned staging. */
    prepareStaging: function (context, release, runId) {
        let directory = context.configuration.stagingDirectory || 'import/content-packs';
        let rootPath = path.resolve(
            NODICS.getServerPath(),
            (CONFIG.get('data').dataDirName || 'temp'),
            directory,
            runId
        );
        let inputPath = path.join(rootPath, 'input');
        let outputPath = path.join(rootPath, 'output');
        fse.ensureDirSync(rootPath);
        fse.copySync(release.contentPath, inputPath, {
            overwrite: true,
            errorOnExist: false
        });
        return { rootPath: rootPath, inputPath: inputPath, outputPath: outputPath };
    },

    /** Finds the installed release from authoritative import history. */
    findInstalledRelease: function (tenant, packCode) {
        let historyService = SERVICE.DefaultImportRunHistoryService;
        if (!historyService || typeof historyService.getImportRunService !== 'function') {
            return Promise.resolve(undefined);
        }
        let modelService = historyService.getImportRunService();
        if (!modelService || typeof modelService.get !== 'function') {
            return Promise.resolve(undefined);
        }
        return modelService.get({
            tenant: tenant,
            query: {
                contentPackCode: packCode,
                status: 'COMPLETED'
            },
            searchOptions: {
                limit: 100,
                sort: { creationTime: -1 }
            }
        }).then(result => this.selectLatestInstalledRelease(result && result.result))
            .catch(() => undefined);
    },

    /**
     * Selects the most recently completed release without depending on a
     * database adapter honoring model-level sort options.
     *
     * @param {Array<Object>} releases Completed content-pack import runs.
     * @returns {Object|undefined} Most recently completed release.
     */
    selectLatestInstalledRelease: function (releases) {
        return (releases || []).reduce((latest, release) => {
            if (!latest) return release;
            let releaseTime = new Date(
                release.finishedAt || release.startedAt || release.updateTime ||
                release.creationTime || 0
            ).getTime();
            let latestTime = new Date(
                latest.finishedAt || latest.startedAt || latest.updateTime ||
                latest.creationTime || 0
            ).getTime();
            return releaseTime > latestTime ? release : latest;
        }, undefined);
    },

    /** Enforces content-pack downgrade and checksum policy. */
    validateUpdatePolicy: function (context, release, installedRelease) {
        if (!installedRelease) return;
        let policy = context.pack.updatePolicy || {};
        let versionComparison = this.compareVersions(release.version, installedRelease.contentPackVersion);
        if (versionComparison < 0 && policy.allowDowngrade !== true) {
            throw this.createError('ERR_IMP_00003', 'Content-pack downgrade is not allowed');
        }
        if (versionComparison === 0 &&
            installedRelease.contentPackChecksum &&
            installedRelease.contentPackChecksum !== release.checksum &&
            policy.sameVersionContentChange !== 'ALLOW') {
            throw this.createError('ERR_IMP_00003', 'Content-pack release changed without a version change');
        }
    },

    /** Compares dotted numeric release versions. */
    compareVersions: function (left, right) {
        let leftParts = String(left || '').split('.').map(value => Number(value) || 0);
        let rightParts = String(right || '').split('.').map(value => Number(value) || 0);
        let size = Math.max(leftParts.length, rightParts.length);
        for (let index = 0; index < size; index++) {
            if ((leftParts[index] || 0) > (rightParts[index] || 0)) return 1;
            if ((leftParts[index] || 0) < (rightParts[index] || 0)) return -1;
        }
        return 0;
    },

    /** Builds the client-safe installation and availability response. */
    buildStatusData: function (context, availableRelease, installedRelease, activeRun) {
        let state = 'NOT_INSTALLED';
        if (!context.enabled) state = 'DISABLED';
        else if (activeRun) state = 'IMPORTING';
        else if (!availableRelease.available) state = 'SOURCE_UNAVAILABLE';
        else if (installedRelease) {
            state = installedRelease.contentPackVersion === availableRelease.version &&
                installedRelease.contentPackChecksum === availableRelease.checksum ?
                'CURRENT' : 'UPDATE_AVAILABLE';
        }
        let allowedOperations = [];
        if (context.enabled && availableRelease.available && !activeRun) {
            if (!installedRelease) allowedOperations.push('IMPORT');
            else if (state === 'UPDATE_AVAILABLE') allowedOperations.push('UPDATE');
        }
        return {
            code: context.code,
            enabled: context.enabled,
            state: state,
            available: availableRelease.available === true,
            installedVersion: installedRelease && installedRelease.contentPackVersion || null,
            availableVersion: availableRelease.version || null,
            runId: activeRun && activeRun.runId || installedRelease && installedRelease.runId || null,
            allowedOperations: allowedOperations,
            presentation: Object.assign({}, context.pack.presentation || {})
        };
    },

    /** Resolves and validates the route pack code. */
    resolvePackCode: function (request) {
        return request && (request.packCode ||
            request.httpRequest && request.httpRequest.params && request.httpRequest.params.packCode);
    },

    /** Resolves trusted tenant context. */
    resolveTenant: function (request) {
        return request && request.tenant || CONFIG.get('defaultTenant') || 'default';
    },

    /** Creates a process-local tenant and pack execution key. */
    createTenantPackKey: function (tenant, packCode) {
        return tenant + ':' + packCode;
    },

    /** Creates a unique content-pack import run identifier. */
    createRunId: function (packCode) {
        return 'contentPack_' + packCode + '_' + Date.now() + '_' +
            crypto.randomBytes(6).toString('hex');
    },

    /** Creates a stable sanitized import error. */
    createError: function (code, message) {
        if (typeof CLASSES !== 'undefined' && CLASSES.DataImportError) {
            return new CLASSES.DataImportError(code, message);
        }
        let error = new Error(message);
        error.code = code;
        return error;
    }
};
