/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nMedia/src/service/storage/defaultMediaImportSourceResolverService
 * @description Resolves backend-only media descriptors that nImport can stage as governed import sources.
 * @layer service
 * @owner nMedia
 * @override Later storage providers may override readable-source resolution while preserving nMedia upload and storage authority.
 */
module.exports = {

    /** Initializes media import source resolver. */
    init: function () {
        return Promise.resolve(true);
    },

    /** Finalizes media import source resolver. */
    postInit: function () {
        return Promise.resolve(true);
    },

    /**
     * Returns effective media import-source policy.
     *
     * @returns {Object} Import-source policy.
     */
    policy: function () {
        let media = CONFIG && CONFIG.get ? (CONFIG.get('media') || {}) : {};
        let lookup = media.importSource || {};
        return {
            allowedFolders: lookup.allowedFolders || ['importSources'],
            allowedFormats: lookup.allowedFormats || ['importFile'],
            allowedStatuses: lookup.allowedStatuses || ['READY', 'CONSUMED'],
            maximumResults: lookup.maximumResults || 2
        };
    },

    /**
     * Resolves one media item into a backend-only import source descriptor.
     *
     * @param {Object} request Media import-source request.
     * @returns {Promise<Object>} Trusted backend descriptor.
     */
    resolve: async function (request) {
        request = request || {};
        let mediaCode = request.mediaCode || request.code || (request.source && request.source.mediaCode);
        if (!mediaCode) {
            throw new CLASSES.NodicsError('ERR_MED_00011', 'Media code is required for import source resolution');
        }
        let media = await this.loadMedia(request, mediaCode);
        this.validateImportSourceMedia(media);
        let source = SERVICE.DefaultMediaStorageProviderRegistryService.resolveImportSource({
            tenant: request.tenant,
            authData: request.authData,
            providerCode: media.providerCode,
            storageKey: media.storageKey,
            originalFileName: media.originalFileName,
            storedFileName: media.storedFileName,
            mimeType: media.mimeType,
            extension: media.extension,
            sizeBytes: media.sizeBytes,
            checksum: media.checksum,
            checksumAlgorithm: media.checksumAlgorithm
        });
        return {
            mediaCode: media.code,
            folderCode: media.folderCode,
            formatCode: media.formatCode,
            providerCode: media.providerCode,
            fileName: source.fileName,
            mimeType: source.mimeType,
            extension: source.extension,
            sizeBytes: source.sizeBytes,
            checksum: source.checksum,
            checksumAlgorithm: source.checksumAlgorithm,
            source: source
        };
    },

    /**
     * Loads one active media model through the generated media service.
     *
     * @param {Object} request Media source request.
     * @param {string} mediaCode Media code.
     * @returns {Promise<Object>} Media model.
     */
    loadMedia: async function (request, mediaCode) {
        let service = SERVICE.DefaultMediaService;
        if (!service || typeof service.get !== 'function') {
            throw new CLASSES.NodicsError('ERR_MED_00009', 'Media metadata service is unavailable');
        }
        let policy = this.policy();
        let response = await service.get({
            tenant: request.tenant,
            authData: request.authData,
            query: {
                code: mediaCode,
                status: { $in: policy.allowedStatuses }
            },
            searchOptions: { limit: policy.maximumResults }
        });
        let items = this.items(response).filter(item => item.code === mediaCode);
        if (items.length !== 1) {
            throw new CLASSES.NodicsError('ERR_MED_00011', 'Media import source is missing or ambiguous');
        }
        return items[0];
    },

    /**
     * Extracts generated-service result items.
     *
     * @param {Object} response Generated service response.
     * @returns {Object[]} Result items.
     */
    items: function (response) {
        if (!response) return [];
        if (Array.isArray(response.result)) return response.result;
        if (response.result) return [response.result];
        if (Array.isArray(response.data)) return response.data;
        if (response.data) return [response.data];
        return [];
    },

    /**
     * Validates that a media item may be consumed by import.
     *
     * @param {Object} media Media model.
     * @returns {boolean} True when valid.
     */
    validateImportSourceMedia: function (media) {
        let policy = this.policy();
        if (!policy.allowedFolders.includes(media.folderCode)) {
            throw new CLASSES.NodicsError('ERR_MED_00011', 'Media folder is not allowed for import sources');
        }
        if (media.formatCode && policy.allowedFormats.length && !policy.allowedFormats.includes(media.formatCode)) {
            throw new CLASSES.NodicsError('ERR_MED_00011', 'Media format is not allowed for import sources');
        }
        if (!media.providerCode || !media.storageKey) {
            throw new CLASSES.NodicsError('ERR_MED_00011', 'Media import source storage metadata is incomplete');
        }
        return true;
    }
};
