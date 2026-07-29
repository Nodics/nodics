/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nMedia/src/service/storage/defaultMediaStorageKeyStrategyRegistryService
 * @description Selects the configured nMedia storage key strategy and delegates
 * logical provider-relative path generation.
 * @layer service
 * @owner nMedia
 * @override Projects may add strategy services through layered configuration
 * without changing providers or caller modules.
 */
module.exports = {

    /** Initializes the media storage key strategy registry. */
    init: function () {
        return Promise.resolve(true);
    },

    /** Finalizes the media storage key strategy registry. */
    postInit: function () {
        return Promise.resolve(true);
    },

    /**
     * Builds a provider-relative storage key through the selected strategy.
     *
     * @param {Object} request Media request.
     * @param {Object} descriptor Validated descriptor.
     * @returns {string} Provider-relative storage key.
     */
    buildStorageKey: function (request, descriptor) {
        let context = this.resolveStrategy(request, descriptor);
        return context.service.buildStorageKey(request, descriptor);
    },

    /**
     * Resolves the strategy code and service from effective configuration.
     *
     * @param {Object} request Media request.
     * @param {Object} descriptor Validated descriptor.
     * @returns {Object} Strategy context.
     */
    resolveStrategy: function (request, descriptor) {
        let configuration = SERVICE.DefaultMediaStoragePolicyService.getConfiguration();
        let storage = configuration.storage || {};
        let strategies = storage.keyStrategies || {};
        let strategyServices = storage.keyStrategyServices || {};
        let folderCode = descriptor && descriptor.folder && descriptor.folder.code || request && request.folderCode || 'default';
        let strategyCode = request && request.keyStrategy || strategies[folderCode] || strategies.default || storage.defaultKeyStrategy;
        let serviceName = strategyServices[strategyCode];
        if (!strategyCode || !serviceName || !SERVICE[serviceName] || typeof SERVICE[serviceName].buildStorageKey !== 'function') {
            throw new CLASSES.NodicsError('ERR_MED_00004', 'Invalid media storage key strategy');
        }
        return {
            code: strategyCode,
            serviceName: serviceName,
            service: SERVICE[serviceName]
        };
    }
};
