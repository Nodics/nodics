/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module startio/envs/startioLocal/test/topology/runtimeContractProbe
 * @description Emits a sanitized runtime-readiness snapshot from a spawned Nodics server so topology tests can prove startup, module loading, tenant activation, internal authentication, and mandatory profile data without adding a production diagnostics route.
 * @layer test
 * @owner startioLocal
 * @override Environment test modules may replace this probe with additional environment-specific readiness assertions.
 */
module.exports = {
    /**
     * Waits for Nodics startup and sends one sanitized contract snapshot to the parent test process.
     *
     * @param {Object} [options] Probe polling options.
     * @returns {NodeJS.Timeout} Polling handle.
     */
    watch: function (options = {}) {
        this.installMessageHandler();
        const intervalMs = Number(options.intervalMs || 100);
        let collecting = false;
        const timer = setInterval(async () => {
            if (collecting || typeof NODICS === 'undefined' || NODICS.getServerState() !== 'started') return;
            collecting = true;
            clearInterval(timer);
            try {
                this.send({
                    type: 'nodics-runtime-contract',
                    snapshot: await this.collect()
                });
            } catch (error) {
                this.send({
                    type: 'nodics-runtime-contract-error',
                    error: error.message || String(error)
                });
            }
        }, intervalMs);
        return timer;
    },

    /** Installs the test-only IPC request handler used for post-startup registry reconciliation assertions. */
    installMessageHandler: function () {
        if (this._messageHandler || typeof process.on !== 'function') return false;
        this._messageHandler = async message => {
            if (!message || message.type !== 'nodics-runtime-registry-request') return;
            try {
                this.send({
                    type: 'nodics-runtime-registry-response',
                    correlationId: message.correlationId,
                    snapshot: await this.collectRegistry()
                });
            } catch (error) {
                this.send({
                    type: 'nodics-runtime-registry-response',
                    correlationId: message.correlationId,
                    error: error.message || String(error)
                });
            }
        };
        process.on('message', this._messageHandler);
        return true;
    },

    /** Collects sanitized observed registry leases directly over test IPC without adding a production route. */
    collectRegistry: async function () {
        let registry = typeof SERVICE !== 'undefined' && SERVICE.DefaultBackofficeRegistryService;
        if (!registry) return { available: false, instances: [] };
        let entries = await registry.getStore().values();
        let discovery = SERVICE.DefaultBackofficeDiscoveryService;
        let moduleNames = Array.from(new Set(entries.map(entry => entry.value.moduleName)));
        let snapshots = discovery ? discovery.getSnapshots(moduleNames) : {};
        return {
            available: true,
            instances: entries.map(entry => ({
                moduleName: entry.value.moduleName,
                instanceId: entry.value.instanceId,
                clientCallable: entry.value.clientCallable === true
            })),
            discoveries: Object.keys(snapshots).sort().map(moduleName => ({
                moduleName: moduleName,
                hash: snapshots[moduleName].hash,
                operations: snapshots[moduleName].operations.length,
                changeClassification: snapshots[moduleName].latestChangeClassification
            })),
            diagnostics: (await registry.diagnostics()).data
        };
    },

    /** Collects runtime facts and mandatory profile-data availability without returning credentials. */
    collect: async function () {
        const defaultTenant = CONFIG.get('defaultTenant') || 'default';
        const profileModule = CONFIG.get('profileModuleName') || 'profile';
        const profileActive = NODICS.isModuleActive(profileModule);
        return {
            serverState: NODICS.getServerState(),
            serverName: NODICS.getServerName(),
            nodeName: NODICS.getNodeName() || null,
            activeModules: NODICS.getActiveModules(),
            indexedModules: Array.from(NODICS.getIndexedModules().values()).map(moduleObject => {
                const rawModule = NODICS.getRawModule(moduleObject.name) || moduleObject;
                return {
                    name: moduleObject.name,
                    kind: rawModule.metaData && rawModule.metaData.nodics && rawModule.metaData.nodics.kind
                };
            }),
            activeTenants: NODICS.getActiveTenants(),
            internalAuthReady: Boolean(NODICS.getInternalAuthToken(defaultTenant)),
            profileActive: profileActive,
            mandatoryData: profileActive ? {
                enterprise: await this.hasRecord(profileModule, defaultTenant, 'EnterpriseModel', 'default'),
                tenant: await this.hasRecord(profileModule, defaultTenant, 'TenantModel', 'default'),
                servicePrincipal: await this.hasRecord(profileModule, defaultTenant, 'EmployeeModel', 'apiAdmin'),
                serviceGroup: await this.hasRecord(profileModule, defaultTenant, 'UserGroupModel', 'serviceAccountUserGroup')
            } : null
        };
    },

    /** Returns whether the selected tenant model contains the mandatory code. */
    hasRecord: async function (moduleName, tenant, modelName, code) {
        const models = NODICS.getModels(moduleName, tenant);
        const model = models && models[modelName];
        if (!model || typeof model.getItems !== 'function') return false;
        const response = await model.getItems({ tenant: tenant, query: { code: code } });
        const records = Array.isArray(response) ? response : response && response.result;
        return Array.isArray(records) && records.length > 0;
    },

    /** Sends the sanitized probe result over the test-only child-process IPC channel. */
    send: function (message) {
        if (typeof process.send === 'function') process.send(message);
    }
};
