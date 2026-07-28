/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const fs = require('fs');
const path = require('path');

/**
 * @module gFramework/nMedia/src/service/storage/provider/defaultLocalMediaStorageProviderService
 * @description Local filesystem media provider for development and simple deployments.
 * @layer service
 * @owner nMedia
 * @override Production deployments may replace the active provider with NAS or cloud providers without changing callers.
 */
module.exports = {

    /** Initializes the local media storage provider. */
    init: function () {
        return Promise.resolve(true);
    },

    /** Finalizes the local media storage provider. */
    postInit: function () {
        return Promise.resolve(true);
    },

    /**
     * Resolves a local filesystem location and safe URL.
     *
     * @param {Object} request Media request with provider config.
     * @returns {Object} Safe location descriptor.
     */
    resolveLocation: function (request) {
        let descriptor = SERVICE.DefaultMediaStoragePolicyService.validateDescriptor(request);
        let storageKey = SERVICE.DefaultMediaStorageKeyService.buildStorageKey(request);
        let basePath = this.resolveBasePath(request.provider && request.provider.basePath);
        let absolutePath = path.resolve(basePath, storageKey);
        if (!absolutePath.startsWith(basePath + path.sep) && absolutePath !== basePath) {
            throw new CLASSES.NodicsError('ERR_MED_00004', 'Unsafe media storage key');
        }
        let baseUrl = String((request.provider && request.provider.baseUrl) || '').replace(/\/+$/, '');
        return {
            providerCode: request.providerCode || 'local',
            folderCode: descriptor.folder.code,
            access: descriptor.folder.access || 'PRIVATE',
            storageKey: storageKey,
            fileName: descriptor.fileName,
            originalFileName: descriptor.originalFileName,
            extension: descriptor.extension,
            mimeType: descriptor.mimeType,
            sizeBytes: descriptor.sizeBytes,
            absolutePath: this.shouldExposeAbsolutePath(request) ? absolutePath : undefined,
            internalAbsolutePath: absolutePath,
            url: baseUrl ? baseUrl + '/' + storageKey : undefined
        };
    },

    /**
     * Writes a parsed internal media buffer to local storage.
     *
     * @param {Object} request Media storage request.
     * @returns {Promise<Object>} Stored descriptor.
     */
    store: function (request) {
        return new Promise((resolve, reject) => {
            try {
                let location = this.resolveLocation(request);
                let content = request.buffer || request.content;
                if (!Buffer.isBuffer(content)) {
                    throw new CLASSES.NodicsError('ERR_MED_00001', 'Invalid media request: buffer is required');
                }
                fs.mkdirSync(path.dirname(location.internalAbsolutePath), { recursive: true });
                fs.writeFile(location.internalAbsolutePath, content, (error) => {
                    if (error) {
                        reject(new CLASSES.NodicsError(error, null, 'ERR_MED_00006'));
                    } else {
                        resolve(Object.assign({}, location, { sizeBytes: content.length }));
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Removes a local media file.
     *
     * @param {Object} request Media remove request.
     * @returns {Promise<Object>} Removal result.
     */
    remove: function (request) {
        return new Promise((resolve, reject) => {
            try {
                let basePath = this.resolveBasePath(request.provider && request.provider.basePath);
                let storageKey = SERVICE.DefaultMediaStorageKeyService.assertSafeStorageKey(request.storageKey);
                let absolutePath = path.resolve(basePath, storageKey);
                if (!absolutePath.startsWith(basePath + path.sep) && absolutePath !== basePath) {
                    throw new CLASSES.NodicsError('ERR_MED_00004', 'Unsafe media storage key');
                }
                fs.unlink(absolutePath, (error) => {
                    if (error && error.code !== 'ENOENT') {
                        reject(new CLASSES.NodicsError(error, null, 'ERR_MED_00006'));
                    } else {
                        resolve({ providerCode: request.providerCode || 'local', storageKey: storageKey, removed: !error });
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Resolves a backend-only readable source descriptor for another Nodics
     * service such as nImport.
     *
     * @param {Object} request Media source request.
     * @returns {Object} Internal readable source descriptor.
     */
    resolveImportSource: function (request) {
        let basePath = this.resolveBasePath(request.provider && request.provider.basePath);
        let storageKey = SERVICE.DefaultMediaStorageKeyService.assertSafeStorageKey(request.storageKey);
        let absolutePath = path.resolve(basePath, storageKey);
        if (!absolutePath.startsWith(basePath + path.sep) && absolutePath !== basePath) {
            throw new CLASSES.NodicsError('ERR_MED_00004', 'Unsafe media storage key');
        }
        return {
            providerCode: request.providerCode || 'local',
            storageKey: storageKey,
            absolutePath: absolutePath,
            fileName: request.originalFileName || request.storedFileName || path.basename(storageKey),
            mimeType: request.mimeType,
            extension: request.extension,
            sizeBytes: request.sizeBytes,
            checksum: request.checksum,
            checksumAlgorithm: request.checksumAlgorithm
        };
    },

    /**
     * Resolves the local provider base path from configured relative or absolute path.
     *
     * @param {string} configuredPath Configured provider base path.
     * @returns {string} Absolute base path.
     */
    resolveBasePath: function (configuredPath) {
        let rawPath = configuredPath || 'runtime/media';
        let root = typeof NODICS !== 'undefined' && NODICS.getNodicsHome ? NODICS.getNodicsHome() : process.cwd();
        return path.resolve(path.isAbsolute(rawPath) ? rawPath : path.join(root, rawPath));
    },

    /**
     * Indicates whether public descriptors may expose absolute local paths.
     *
     * @param {Object} request Media request.
     * @returns {boolean} True only for explicitly configured internal contexts.
     */
    shouldExposeAbsolutePath: function (request) {
        return !!(request && request.internal === true && request.storage && request.storage.exposeAbsolutePath === true);
    }
};
