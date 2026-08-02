/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
    },

    /**
     * Returns safe operational storage-provider metadata for BackOffice users.
     *
     * @param {Object} request Summary request.
     * @returns {Object} Safe provider summary.
     */
    summarizeProviders: function (request) {
        let configuration = SERVICE.DefaultMediaStoragePolicyService.getConfiguration();
        let storage = configuration.storage || {};
        let providers = storage.providers || {};
        let defaultProvider = storage.defaultProvider || 'local';
        return {
            activeProviderCode: defaultProvider,
            keyStrategyName: storage.defaultKeyStrategy || 'default',
            delivery: SERVICE.DefaultMediaStoragePolicyService.projectDeliveryPolicy(),
            providers: Object.keys(providers).sort().map(code => this.projectProviderSummary(code, providers[code], code === defaultProvider))
        };
    },

    /**
     * Projects one provider without exposing paths, buckets, credentials, or secrets.
     *
     * @param {string} code Provider code.
     * @param {Object} provider Provider configuration.
     * @param {boolean} active Active provider flag.
     * @returns {Object} Safe provider summary.
     */
    projectProviderSummary: function (code, provider, active) {
        provider = provider || {};
        let serviceName = provider.service || '';
        let service = serviceName && SERVICE ? SERVICE[serviceName] : undefined;
        let providerType = this.providerType(code);
        let health = service && typeof service.summarizeHealth === 'function'
            ? service.summarizeHealth({ providerCode: code, provider: provider, active: active })
            : { status: provider.enabled === true ? 'UNKNOWN' : 'DISABLED', message: provider.enabled === true ? 'Provider health is not published yet.' : 'Provider is disabled.' };
        return {
            providerCode: code,
            providerType: providerType,
            active: active,
            enabled: provider.enabled === true,
            health: health,
            deliveryMode: this.deliveryMode(provider),
            secretsHidden: true,
            rawPathsHidden: true
        };
    },

    /**
     * Resolves a provider type from the configured provider code.
     *
     * @param {string} code Provider code.
     * @returns {string} Provider type.
     */
    providerType: function (code) {
        return ({
            local: 'LOCAL_FILESYSTEM',
            nas: 'SHARED_FILESYSTEM',
            s3: 'S3_COMPATIBLE',
            azureBlob: 'AZURE_BLOB',
            gcpStorage: 'GCP_STORAGE',
            ftp: 'FTP',
            sftp: 'SFTP'
        })[code] || 'CUSTOM';
    },

    /**
     * Resolves a safe delivery mode label without returning URLs or secrets.
     *
     * @param {Object} provider Provider configuration.
     * @returns {string} Delivery mode.
     */
    deliveryMode: function (provider) {
        if (!provider || provider.enabled !== true) {
            return 'DISABLED';
        }
        if (provider.baseUrl) {
            return 'MEDIA_ENDPOINT';
        }
        return 'BACKEND_DELIVERY';
    }
};
