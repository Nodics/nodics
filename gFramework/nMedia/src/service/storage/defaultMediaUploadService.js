/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('crypto');

/**
 * @module gFramework/nMedia/src/service/storage/defaultMediaUploadService
 * @description Stores nMedia-parsed media uploads and persists nMedia-owned
 * metadata using the generated media model service.
 * @layer service
 * @owner nMedia
 * @override Later layers may decorate upload governance while preserving
 * provider-neutral storage and media metadata ownership in nMedia.
 */
module.exports = {

    /** Initializes the media upload service. */
    init: function () {
        return Promise.resolve(true);
    },

    /** Finalizes the media upload service. */
    postInit: function () {
        return Promise.resolve(true);
    },

    /**
     * Stores one parsed upload and persists its media metadata.
     *
     * @param {Object} request Upload request.
     * @returns {Promise<Object>} Persisted media descriptor.
     */
    upload: async function (request) {
        let file = this.resolveFile(request);
        let checksumAlgorithm = this.resolveChecksumAlgorithm(request);
        let checksum = this.calculateChecksum(file.buffer, checksumAlgorithm);
        let mediaCode = request.mediaCode || request.code || this.buildMediaCode(file, checksum);
        let storage = await SERVICE.DefaultMediaStorageProviderRegistryService.store({
            tenant: request.tenant,
            authData: request.authData,
            enterpriseCode: request.enterpriseCode,
            moduleName: request.moduleName,
            schemaName: request.schemaName,
            indexName: request.indexName,
            keyStrategy: request.keyStrategy,
            folderCode: request.folderCode || 'default',
            formatCode: request.formatCode || 'original',
            mediaCode: mediaCode,
            fileName: file.originalFileName || file.fileName,
            originalFileName: file.originalFileName || file.fileName,
            mimeType: file.mimeType,
            sizeBytes: file.sizeBytes,
            buffer: file.buffer
        });
        let media = {
            code: mediaCode,
            active: true,
            name: request.name || file.originalFileName || mediaCode,
            description: request.description,
            folderCode: storage.folderCode,
            formatCode: request.formatCode || 'original',
            providerCode: storage.providerCode,
            storageKey: storage.storageKey,
            originalFileName: storage.originalFileName,
            storedFileName: storage.fileName,
            relativePath: storage.relativePath || storage.storageKey,
            fullPath: storage.fullPath || storage.absolutePath,
            url: storage.url,
            accessUrl: storage.accessUrl || storage.url,
            mimeType: storage.mimeType,
            extension: storage.extension,
            sizeBytes: storage.sizeBytes,
            checksum: checksum,
            checksumAlgorithm: checksumAlgorithm,
            access: storage.access,
            status: 'READY'
        };
        let service = SERVICE.DefaultMediaService;
        if (!service || typeof service.save !== 'function') {
            throw new CLASSES.NodicsError('ERR_MED_00009', 'Media metadata service is unavailable');
        }
        let response = await service.save({
            tenant: request.tenant,
            authData: request.authData,
            moduleName: 'media',
            model: media
        });
        return this.firstResult(response) || media;
    },

    /**
     * Resolves exactly one uploaded file from nMedia-parsed descriptors.
     *
     * @param {Object} request Upload request.
     * @returns {Object} Parsed file descriptor.
     */
    resolveFile: function (request) {
        let files = request && request.files || [];
        let fileField = request && request.fileField;
        let matching = fileField ? files.filter(file => file.fieldName === fileField) : files;
        if (matching.length !== 1) {
            throw new CLASSES.NodicsError('ERR_MED_00001', 'Invalid media request: exactly one uploaded file is required');
        }
        let file = matching[0];
        if (!Buffer.isBuffer(file.buffer) || Number(file.sizeBytes || 0) <= 0) {
            throw new CLASSES.NodicsError('ERR_MED_00001', 'Invalid media request: uploaded file content is required');
        }
        return file;
    },

    /**
     * Resolves configured checksum algorithm.
     *
     * @param {Object} request Upload request.
     * @returns {string} Hash algorithm.
     */
    resolveChecksumAlgorithm: function (request) {
        let mediaConfig = SERVICE.DefaultMediaStoragePolicyService.getConfiguration();
        let upload = mediaConfig.upload || {};
        return request.checksumAlgorithm || upload.checksumAlgorithm || 'sha256';
    },

    /**
     * Calculates upload checksum.
     *
     * @param {Buffer} buffer File content.
     * @param {string} algorithm Hash algorithm.
     * @returns {string} Hex checksum.
     */
    calculateChecksum: function (buffer, algorithm) {
        return crypto.createHash(algorithm).update(buffer).digest('hex');
    },

    /**
     * Builds deterministic media code from original filename and checksum prefix.
     *
     * @param {Object} file Parsed file descriptor.
     * @param {string} checksum File checksum.
     * @returns {string} Media code.
     */
    buildMediaCode: function (file, checksum) {
        let fileName = String(file.originalFileName || file.fileName || 'media').replace(/[^a-zA-Z0-9._-]/g, '-');
        return fileName.replace(/\.[^.]+$/, '') + '-' + checksum.substring(0, 16);
    },

    /**
     * Extracts first generated service result.
     *
     * @param {Object} response Generated service response.
     * @returns {Object|undefined} First persisted model when available.
     */
    firstResult: function (response) {
        if (!response) return undefined;
        if (Array.isArray(response.result)) return response.result[0];
        if (response.result) return response.result;
        if (Array.isArray(response.data)) return response.data[0];
        return response.data;
    }
};
