/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nMedia/src/service/storage/defaultMediaDeliveryService
 * @description Resolves media-code based content delivery through nMedia-owned
 * access policy and provider storage descriptors.
 * @layer service
 * @owner nMedia
 * @override Projects may extend signed/private delivery policy while preserving
 * media-code based lookup and provider-owned storage paths.
 */
module.exports = {

    /** Initializes the media delivery service. */
    init: function () {
        return Promise.resolve(true);
    },

    /** Finalizes the media delivery service. */
    postInit: function () {
        return Promise.resolve(true);
    },

    /**
     * Resolves a media item into a file delivery descriptor.
     *
     * @param {Object} request Delivery request.
     * @returns {Promise<Object>} File delivery descriptor.
     */
    deliver: async function (request) {
        request = request || {};
        let mediaCode = this.resolveMediaCode(request);
        let policy = this.policy();
        if (policy.enabled !== true) {
            throw new CLASSES.NodicsError('ERR_MED_00012', 'Media delivery is disabled by nMedia policy');
        }
        let media = await this.loadMedia(request, mediaCode);
        this.validateAccess(request, media);
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
            code: 'SUC_MED_00005',
            mediaCode: media.code,
            filePath: source.absolutePath,
            fileName: source.fileName || media.originalFileName || media.storedFileName || media.code,
            mimeType: media.mimeType || source.mimeType,
            cacheControl: policy.cacheControl,
            contentDisposition: policy.contentDisposition || 'inline'
        };
    },

    /**
     * Resolves the requested media code from direct or HTTP request shapes.
     *
     * @param {Object} request Delivery request.
     * @returns {string} Media code.
     */
    resolveMediaCode: function (request) {
        let params = request.params || request.httpRequest && request.httpRequest.params || {};
        let query = request.query || request.httpRequest && request.httpRequest.query || {};
        let mediaCode = request.mediaCode || params.mediaCode || query.mediaCode;
        if (typeof mediaCode !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,191}$/.test(mediaCode)) {
            throw new CLASSES.NodicsError('ERR_MED_00012', 'Invalid media delivery request: media code is required');
        }
        return mediaCode;
    },

    /**
     * Loads one deliverable media model through the generated media service.
     *
     * @param {Object} request Delivery request.
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
            throw new CLASSES.NodicsError('ERR_MED_00012', 'Media content is missing or ambiguous');
        }
        return items[0];
    },

    /**
     * Enforces nMedia delivery access policy.
     *
     * @param {Object} request Delivery request.
     * @param {Object} media Media model.
     * @returns {boolean} True when allowed.
     */
    validateAccess: function (request, media) {
        let policy = this.policy();
        let access = media.access || 'PRIVATE';
        if (access === 'PUBLIC' && policy.publicAccessEnabled === true) return true;
        if (access === 'SIGNED' && policy.signedAccessEnabled === true) {
            throw new CLASSES.NodicsError('ERR_MED_00012', 'Signed media delivery token validation is not configured');
        }
        if (access === 'PRIVATE' && policy.privateAccessEnabled === true) {
            throw new CLASSES.NodicsError('ERR_MED_00012', 'Private media delivery authorization is not configured');
        }
        throw new CLASSES.NodicsError('ERR_MED_00012', 'Media access policy does not allow direct delivery');
    },

    /**
     * Returns effective delivery policy.
     *
     * @returns {Object} Delivery policy.
     */
    policy: function () {
        let media = CONFIG && CONFIG.get ? (CONFIG.get('media') || {}) : {};
        let delivery = media.delivery || {};
        return {
            enabled: delivery.enabled !== false,
            allowedStatuses: delivery.allowedStatuses || ['READY', 'CONSUMED'],
            publicAccessEnabled: delivery.publicAccessEnabled === true,
            signedAccessEnabled: delivery.signedAccessEnabled === true,
            privateAccessEnabled: delivery.privateAccessEnabled === true,
            maximumResults: delivery.maximumResults || 2,
            cacheControl: delivery.cacheControl || 'public, max-age=3600',
            contentDisposition: delivery.contentDisposition || 'inline'
        };
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
    }
};
