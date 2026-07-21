/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const { Client } = require('hazelcast-client');

/**
 * @module nCache/hazelcastCache/service/engine/DefaultHazelcastCacheEngineService
 * @description Creates and manages official Hazelcast Node.js clients for enabled nCache engines.
 * @layer service
 * @owner nCache/hazelcastCache
 * @override Projects may layer cluster discovery, TLS, credentials, and client properties while preserving readiness and shutdown contracts.
 */
module.exports = {
    /** Initializes the engine service. */ init: function () { return Promise.resolve(true); },
    /** Completes engine-service initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Converts layered engine options into the official Hazelcast client configuration. */
    buildClientConfig: function (engineConfig) {
        let options = Object.assign({}, engineConfig && engineConfig.options || {});
        let config = { clusterName: options.clusterName || 'dev', network: {
            clusterMembers: Array.isArray(options.clusterMembers) && options.clusterMembers.length ? options.clusterMembers.slice() : ['127.0.0.1:5701'],
            connectionTimeout: Number(options.connectionTimeoutMs || 5000)
        } };
        if (options.connectionStrategy) config.connectionStrategy = options.connectionStrategy;
        if (options.properties) config.properties = options.properties;
        if (options.security) config.security = options.security;
        if (options.ssl) config.network.ssl = options.ssl;
        return config;
    },
    /** Connects one enabled module engine to Hazelcast. */
    initCache: async function (hazelcastCacheConfig, moduleName) {
        try {
            this.LOG.info('Initializing Hazelcast cache instance for module: ' + moduleName);
            let client = await Client.newHazelcastClient(this.buildClientConfig(hazelcastCacheConfig));
            return { code: 'SUC_CACHE_00000', result: client };
        } catch (error) {
            throw new CLASSES.CacheError(error, 'While connecting Hazelcast cache client for module: ' + moduleName);
        }
    },
    /** Supports schema-channel initialization through the shared Hazelcast client. */ schema: function (config, moduleName) { return this.initCache(config, moduleName); },
    /** Supports router-channel initialization through the shared Hazelcast client. */ router: function (config, moduleName) { return this.initCache(config, moduleName); },
    /** Hazelcast distributed maps require no local event registration. */ registerEvents: function () { return Promise.resolve(true); }
};
