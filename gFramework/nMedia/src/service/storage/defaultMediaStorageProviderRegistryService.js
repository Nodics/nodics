/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nMedia/src/service/storage/defaultMediaStorageProviderRegistryService
 * @description Selects and invokes the configured nMedia storage provider.
 * @layer service
 * @owner nMedia
 * @override Later layers may add provider services behind this registry without changing callers.
 */
module.exports = {

    /** Initializes the media storage provider registry. */
    init: function () {
        return Promise.resolve(true);
    },

    /** Finalizes the media storage provider registry. */
    postInit: function () {
        return Promise.resolve(true);
    },

    /**
     * Resolves active provider service and policy.
     *
     * @param {Object} request Media request.
     * @returns {Object} Provider context.
     */
    resolveProvider: function (request) {
        let policy = SERVICE.DefaultMediaStoragePolicyService.getProviderPolicy(request && request.providerCode);
        let serviceName = policy.provider.service;
        if (!serviceName || !SERVICE[serviceName]) {
            throw new CLASSES.NodicsError('ERR_MED_00002', 'Invalid media storage provider service');
        }
        return {
            code: policy.code,
            policy: policy,
            serviceName: serviceName,
            service: SERVICE[serviceName]
        };
    },

    /**
     * Resolves a storage location using the active provider.
     *
     * @param {Object} request Media request.
     * @returns {Object} Resolved location.
     */
    resolveLocation: function (request) {
        let context = this.resolveProvider(request);
        return context.service.resolveLocation(Object.assign({}, request, {
            providerCode: context.code,
            provider: context.policy.provider,
            storage: context.policy.storage
        }));
    },

    /**
     * Stores a parsed internal media payload using the active provider.
     *
     * @param {Object} request Media storage request.
     * @returns {Promise<Object>} Stored descriptor.
     */
    store: function (request) {
        let context = this.resolveProvider(request);
        return context.service.store(Object.assign({}, request, {
            providerCode: context.code,
            provider: context.policy.provider,
            storage: context.policy.storage
        }));
    },

    /**
     * Removes media data through the active provider.
     *
     * @param {Object} request Media remove request.
     * @returns {Promise<Object>} Removal result.
     */
    remove: function (request) {
        let context = this.resolveProvider(request);
        return context.service.remove(Object.assign({}, request, {
            providerCode: context.code,
            provider: context.policy.provider,
            storage: context.policy.storage
        }));
    },

    /**
     * Resolves a backend-only readable media source descriptor for another
     * trusted Nodics service.
     *
     * @param {Object} request Media source request.
     * @returns {Object} Internal readable source descriptor.
     */
    resolveImportSource: function (request) {
        let context = this.resolveProvider(request);
        if (typeof context.service.resolveImportSource !== 'function') {
            throw new CLASSES.NodicsError('ERR_MED_00011', 'Media storage provider cannot resolve import sources');
        }
        return context.service.resolveImportSource(Object.assign({}, request, {
            providerCode: context.code,
            provider: context.policy.provider,
            storage: context.policy.storage
        }));
    }
};
