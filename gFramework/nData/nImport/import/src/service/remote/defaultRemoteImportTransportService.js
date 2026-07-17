/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const crypto = require('crypto');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

/**
 * @module import/service/remote/DefaultRemoteImportTransportService
 * @description Resolves layered remote-import sources and adapters, stages non-executable data inside the active server module, and enforces tenant, module, timeout, retry, path, symlink, size, extension, and checksum policies before import processing.
 * @layer service
 * @owner import
 * @override Projects register source and transport entries through `data.remoteImport` and provide adapter services implementing `stage(context)` without changing framework code.
 */
module.exports = {
    /** Returns the effective layered remote-import configuration. */
    getConfig: function () {
        const data = CONFIG.get('data') || {};
        return data.remoteImport || {};
    },

    /** Resolves and validates the configured source, transport, adapter, tenant, and modules. */
    resolve: function (request) {
        const config = this.getConfig();
        const sourceName = request.remoteImport && request.remoteImport.source;
        const source = config.sources && config.sources[sourceName];
        if (config.enabled !== true) throw new CLASSES.DataImportError('ERR_IMP_00003', 'Remote import is disabled');
        if (!sourceName || !source || source.enabled === false) throw new CLASSES.DataImportError('ERR_IMP_00003', 'Remote import source is not enabled: ' + (sourceName || 'undefined'));
        const tenant = request.tenant || CONFIG.get('defaultTenant') || 'default';
        const allowedTenants = [].concat(source.tenants || []);
        if (allowedTenants.length > 0 && !allowedTenants.includes('*') && !allowedTenants.includes(tenant)) {
            throw new CLASSES.DataImportError('ERR_IMP_00003', 'Remote import source is not allowed for tenant: ' + tenant);
        }
        const allowedModules = [].concat(source.modules || []);
        const invalidModules = [].concat(request.modules || []).filter(moduleName => allowedModules.length > 0 && !allowedModules.includes('*') && !allowedModules.includes(moduleName));
        if (invalidModules.length > 0) throw new CLASSES.DataImportError('ERR_IMP_00003', 'Remote import source does not allow modules: ' + invalidModules.join(', '));
        const transportName = source.transport || config.defaultTransport;
        const transport = config.transports && config.transports[transportName] || {};
        const serviceName = source.service || transport.service;
        const adapter = serviceName && SERVICE[serviceName];
        if (!transportName || transport.enabled === false || !adapter || typeof adapter.stage !== 'function') {
            throw new CLASSES.DataImportError('ERR_IMP_00003', 'Remote import transport adapter is not available: ' + (transportName || 'undefined'));
        }
        return { config, sourceName, source, transportName, transport, serviceName, adapter, tenant };
    },

    /** Stages remote data through the configured adapter and validates the complete result. */
    stage: async function (request) {
        const resolved = this.resolve(request);
        const runId = request.importRun && request.importRun.runId || Date.now().toString();
        const safeRunId = String(runId).replace(/[^A-Za-z0-9_.-]/g, '_');
        const serverPath = path.resolve(NODICS.getServerPath());
        const targetPath = path.resolve(serverPath, (CONFIG.get('data').dataDirName || 'temp'), 'import', 'remote', safeRunId, 'staging');
        if (targetPath !== serverPath && !targetPath.startsWith(serverPath + path.sep)) {
            throw new CLASSES.DataImportError('ERR_IMP_00003', 'Remote import staging must remain inside the active server module');
        }
        const policy = this.buildPolicy(resolved);
        let result;
        let attempt = 0;
        let lastError;
        while (attempt <= policy.retries) {
            attempt++;
            await fse.remove(targetPath);
            await fse.ensureDir(targetPath);
            try {
                const abortController = typeof AbortController !== 'undefined' ? new AbortController() : null;
                result = await this.withTimeout(resolved.adapter.stage({
                    tenant: resolved.tenant,
                    modules: [].concat(request.modules || []),
                    sourceName: resolved.sourceName,
                    source: resolved.source,
                    transport: resolved.transport,
                    targetPath: targetPath,
                    timeoutMs: policy.timeoutMs,
                    signal: abortController && abortController.signal,
                    correlationId: request.correlationId || request.importRun && request.importRun.runId
                }), policy.timeoutMs, abortController);
                break;
            } catch (error) {
                lastError = error;
            }
        }
        if (!result) {
            await fse.remove(targetPath);
            throw new CLASSES.DataImportError(lastError, 'Remote import transport failed after ' + attempt + ' attempt(s): ' + (lastError && lastError.message || 'unknown error'), 'ERR_IMP_00000');
        }
        let validation;
        try {
            validation = await this.validateStage(targetPath, result, policy);
        } catch (error) {
            await fse.remove(targetPath);
            throw error;
        }
        request.remoteStage = Object.assign({ rootPath: targetPath }, validation);
        request.remoteImportPolicy = {
            source: resolved.sourceName,
            transport: resolved.transportName,
            headerDataType: resolved.source.headerDataType || resolved.config.defaultHeaderDataType || 'core',
            cleanupStaging: resolved.source.cleanupStaging !== false && resolved.config.cleanupStaging !== false
        };
        if (request.importRun) request.importRun.remote = {
            source: resolved.sourceName,
            transport: resolved.transportName,
            attempts: attempt,
            fileCount: validation.fileCount,
            totalBytes: validation.totalBytes
        };
        return request.remoteStage;
    },

    /** Builds bounded effective policy without exposing source credentials to diagnostics. */
    buildPolicy: function (resolved) {
        const merged = Object.assign({}, resolved.config.policy || {}, resolved.transport.policy || {}, resolved.source.policy || {});
        return {
            timeoutMs: Math.max(1, Number(merged.timeoutMs || 30000)),
            retries: Math.max(0, Math.min(5, Number(merged.retries || 0))),
            maxFiles: Math.max(1, Number(merged.maxFiles || 100)),
            maxFileBytes: Math.max(1, Number(merged.maxFileBytes || 10 * 1024 * 1024)),
            maxTotalBytes: Math.max(1, Number(merged.maxTotalBytes || 100 * 1024 * 1024)),
            allowedExtensions: [].concat(merged.allowedExtensions || ['json', 'csv', 'xlsx']).map(value => String(value).replace(/^\./, '').toLowerCase()),
            requireChecksums: merged.requireChecksums !== false
        };
    },

    /** Applies an adapter timeout without mutating adapter state. */
    withTimeout: function (promise, timeoutMs, abortController) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                if (abortController) abortController.abort();
                reject(new Error('Remote import transport timed out after ' + timeoutMs + 'ms'));
            }, timeoutMs);
            Promise.resolve(promise).then(result => {
                clearTimeout(timer);
                resolve(result);
            }).catch(error => {
                clearTimeout(timer);
                reject(error);
            });
        });
    },

    /** Validates every staged file and returns a sanitized inventory summary. */
    validateStage: async function (targetPath, result, policy) {
        const resultRoot = path.resolve(result && result.rootPath || targetPath);
        if (resultRoot !== targetPath) throw new CLASSES.DataImportError('ERR_IMP_00003', 'Remote adapter must stage inside its assigned target');
        const descriptors = new Map([].concat(result && result.files || []).map(file => [String(file.path || '').replace(/\\/g, '/'), file]));
        const files = this.walkFiles(targetPath);
        if (files.length === 0) throw new CLASSES.DataImportError('ERR_IMP_00003', 'Remote adapter staged no data files');
        if (files.length > policy.maxFiles) throw new CLASSES.DataImportError('ERR_IMP_00003', 'Remote import exceeds maximum file count');
        let totalBytes = 0;
        for (const filePath of files) {
            const relativePath = path.relative(targetPath, filePath).replace(/\\/g, '/');
            const extension = path.extname(filePath).slice(1).toLowerCase();
            const stat = fs.lstatSync(filePath);
            if (stat.isSymbolicLink()) throw new CLASSES.DataImportError('ERR_IMP_00003', 'Remote import symbolic links are not allowed: ' + relativePath);
            if (!policy.allowedExtensions.includes(extension)) throw new CLASSES.DataImportError('ERR_IMP_00003', 'Remote import file type is not allowed: ' + extension);
            if (stat.size > policy.maxFileBytes) throw new CLASSES.DataImportError('ERR_IMP_00003', 'Remote import file exceeds size limit: ' + relativePath);
            totalBytes += stat.size;
            if (totalBytes > policy.maxTotalBytes) throw new CLASSES.DataImportError('ERR_IMP_00003', 'Remote import exceeds total size limit');
            const descriptor = descriptors.get(relativePath);
            if (policy.requireChecksums && (!descriptor || !descriptor.sha256)) throw new CLASSES.DataImportError('ERR_IMP_00003', 'Remote import checksum is required: ' + relativePath);
            if (descriptor && descriptor.sha256 && this.sha256(filePath) !== String(descriptor.sha256).toLowerCase()) {
                throw new CLASSES.DataImportError('ERR_IMP_00003', 'Remote import checksum mismatch: ' + relativePath);
            }
        }
        return { fileCount: files.length, totalBytes: totalBytes, files: files };
    },

    /** Recursively enumerates regular files while retaining symlink entries for rejection. */
    walkFiles: function (rootPath) {
        let files = [];
        fs.readdirSync(rootPath).sort().forEach(name => {
            const filePath = path.join(rootPath, name);
            const stat = fs.lstatSync(filePath);
            if (stat.isDirectory()) files = files.concat(this.walkFiles(filePath));
            else files.push(filePath);
        });
        return files;
    },

    /** Returns the lowercase SHA-256 digest for one staged file. */
    sha256: function (filePath) {
        return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
    },

    /** Removes the isolated staging directory when effective policy requires cleanup. */
    cleanup: function (request) {
        if (!request.remoteStage || !request.remoteImportPolicy || request.remoteImportPolicy.cleanupStaging === false) return Promise.resolve(true);
        return fse.remove(request.remoteStage.rootPath).then(() => true);
    }
};
