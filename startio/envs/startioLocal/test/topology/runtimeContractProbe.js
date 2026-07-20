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

    /** Installs test-only, operation-whitelisted IPC handlers for runtime contract assertions. */
    installMessageHandler: function () {
        if (this._messageHandler || typeof process.on !== 'function') return false;
        this._messageHandler = async message => {
            if (!message || !message.type) return;
            try {
                if (message.type === 'nodics-runtime-publication-request') {
                    this.send({
                        type: 'nodics-runtime-publication-response',
                        correlationId: message.correlationId,
                        result: await this.executePublicationOperation(message.operation, message.payload || {})
                    });
                    return;
                }
                if (message.type !== 'nodics-runtime-registry-request') return;
                this.send({
                    type: 'nodics-runtime-registry-response',
                    correlationId: message.correlationId,
                    snapshot: await this.collectRegistry()
                });
            } catch (error) {
                this.send({
                    type: message.type === 'nodics-runtime-publication-request' ?
                        'nodics-runtime-publication-response' : 'nodics-runtime-registry-response',
                    correlationId: message.correlationId,
                    error: error.stack || error.message || String(error)
                });
            }
        };
        process.on('message', this._messageHandler);
        return true;
    },

    /** Returns the trusted system identity used only inside the isolated topology-test process. */
    getSystemRequest: function (payload) {
        let tenant = payload.tenant || CONFIG.get('defaultTenant') || 'default';
        let authData = SERVICE.DefaultIdentityGovernanceService && SERVICE.DefaultIdentityGovernanceService.getSystemAuthData ?
            SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(tenant) : { principalId: 'runtime-contract-probe', tenant: tenant };
        return { tenant: tenant, authData: authData, correlationId: payload.correlationId || payload.code };
    },

    /** Executes a bounded publication operation without exposing an arbitrary service invocation bridge. */
    executePublicationOperation: async function (operation, payload) {
        let request = this.getSystemRequest(payload);
        if (operation === 'inspectCmsPublicationRoutes') {
            return Object.values(NODICS.getRouters('cms') || {}).filter(route => route.url)
                .map(route => ({ method: route.method, url: route.url, active: route.active }));
        }
        if (operation === 'seedCmsRelease') {
            let version = Number(payload.version);
            let base = { active: true, accessGroups: ['userGroup'], created: new Date(), updated: new Date(),
                createdBy: 'runtime-contract-probe', updatedBy: 'runtime-contract-probe' };
            let page = Object.assign({}, base, { code: payload.pageCode, versionId: version, name: payload.pageName,
                cmsSite: [payload.site], typeCode: 'runtimeContractPage', cmsComponents: [], renderer: 'page.runtime-contract' });
            let route = Object.assign({}, base, { code: payload.routeCode, versionId: version, site: payload.site, path: payload.path,
                locale: payload.locale || 'en', channel: payload.channel || 'web', page: payload.pageCode,
                routeType: 'PAGE', deliveryState: 'DRAFT', accessMode: 'PUBLIC' });
            let models = NODICS.getModels('cms', request.tenant);
            if (!models || !models.CmsPageModel || !models.CmsPageRouteModel) throw new Error('CMS test fixture models are unavailable');
            await models.CmsPageModel.saveVersionedItems({ tenant: request.tenant, query: { code: page.code }, searchOptions: {}, model: page });
            await models.CmsPageRouteModel.saveVersionedItems({ tenant: request.tenant, query: { code: route.code }, searchOptions: {}, model: route });
            await Promise.all(['cmsPage', 'cmsPageRoute'].map(schemaName => SERVICE.DefaultCacheService.invalidateResource({
                tenant: request.tenant, authData: request.authData, moduleName: 'cms', cacheType: 'schema', resourceName: schemaName
            })));
            return { pageCode: page.code, routeCode: route.code, version: version };
        }
        if (operation === 'publishCmsRelease') {
            if (!SERVICE.DefaultPublicationRequestService || !SERVICE.DefaultPublicationAuditService) {
                let modelNames = NODICS.getActiveModules().map(moduleName => ({ moduleName: moduleName,
                    names: Object.keys(NODICS.getModels(moduleName, request.tenant) || {}).filter(name => /Publication/i.test(name)) }))
                    .filter(entry => entry.names.length > 0);
                throw new Error('Publication persistence service names: ' + Object.keys(SERVICE).filter(name => /Publication/i.test(name)).sort().join(', ') +
                    '; publication models: ' + JSON.stringify(modelNames));
            }
            if (((CONFIG.get('cms') || {}).publication || {}).runtimeRole !== 'STAGED') {
                throw new Error('Effective CMS publication configuration: ' + JSON.stringify((CONFIG.get('cms') || {}).publication));
            }
            let publication;
            try {
                publication = await SERVICE.DefaultWcmsPublicationWorkflowService.publish(Object.assign({}, request, {
                    workflowCarrier: { code: payload.carrierCode, items: payload.items, sourceDetail: { schemaName: 'cmsPageRoute',
                        publication: payload.publication } }
                }));
            } catch (error) {
                let target = ((CONFIG.get('cms') || {}).publication || {}).target || {};
                let descriptor = SERVICE.DefaultModuleService.buildRequest({ moduleName: target.moduleName,
                    connectionName: target.connectionName, connectionType: target.connectionType || 'abstract', methodName: 'POST',
                    apiName: '/publication/target/deploy', requestBody: {} });
                throw new Error((error.stack || error.message || String(error)) + '; target=' + descriptor.uri);
            }
            return publication.feedback;
        }
        if (operation === 'rejectCmsRelease') {
            let created = await SERVICE.DefaultPublicationLifecycleService.create(Object.assign({}, request, {
                publication: payload.publication, reason: 'Runtime topology rejection verification'
            }));
            let validated = await SERVICE.DefaultPublicationLifecycleService.validate(Object.assign({}, request, {
                publicationCode: created.code, expectedRevision: created.revision
            }));
            let pending = await SERVICE.DefaultPublicationLifecycleService.requestApproval(Object.assign({}, request, {
                publicationCode: validated.code, expectedRevision: validated.revision
            }));
            let rejected = await SERVICE.DefaultPublicationLifecycleService.reject(Object.assign({}, request, {
                publicationCode: pending.code, expectedRevision: pending.revision, reason: payload.reason || 'Rejected by runtime contract test'
            }));
            return { code: rejected.code, state: rejected.state, revision: rejected.revision };
        }
        if (operation === 'rollbackCmsRelease') {
            let current = await SERVICE.DefaultPublicationRepositoryService.get(payload.publicationCode, request);
            let result = await SERVICE.DefaultPublicationLifecycleService.rollback(Object.assign({}, request, {
                publicationCode: payload.publicationCode, expectedRevision: current && current.revision,
                reason: payload.reason || 'Runtime topology rollback verification'
            }));
            return { code: result.code, state: result.state, revision: result.revision, targetVersion: result.targetVersion,
                previousOnlineVersion: result.previousOnlineVersion };
        }
        if (operation === 'inspectCmsPublication') {
            let publication = await SERVICE.DefaultPublicationRepositoryService.get(payload.publicationCode, request);
            return publication && { code: publication.code, state: publication.state, revision: publication.revision,
                correlationId: publication.correlationId, auditTrail: publication.auditTrail };
        }
        if (operation === 'inspectCmsDelivery') {
            let result = await SERVICE.DefaultCmsDeliveryService.resolvePage(Object.assign({}, request, {
                router: { publicAccess: true }, delivery: { site: payload.site, path: payload.path,
                    locale: payload.locale || 'en', channel: payload.channel || 'web' }
            }));
            let pointer = await SERVICE.DefaultCmsOnlinePublicationPointerService.get(Object.assign({}, request, {
                query: { site: payload.site, path: payload.path, locale: payload.locale || 'en',
                    channel: payload.channel || 'web', accessMode: 'PUBLIC', active: true }
            }));
            let pointers = pointer && Array.isArray(pointer.result) ? pointer.result : [];
            let receipts = await SERVICE.DefaultCmsPublicationDeploymentReceiptService.get(Object.assign({}, request, {
                query: { active: true }
            }));
            let activeReceiptResponse = pointers[0] && await SERVICE.DefaultCmsPublicationDeploymentReceiptService.get(Object.assign({}, request, {
                query: { active: true, operation: 'DEPLOY', manifestCode: pointers[0].manifestCode }, searchOptions: { limit: 1 }
            }));
            let receiptItems = receipts && Array.isArray(receipts.result) ? receipts.result : [];
            let activeReceipt = activeReceiptResponse && Array.isArray(activeReceiptResponse.result) && activeReceiptResponse.result[0];
            return { delivery: result.result, manifestCode: pointers[0] && pointers[0].manifestCode,
                previousManifestCode: pointers[0] && pointers[0].previousManifestCode,
                pointerCorrelationId: pointers[0] && pointers[0].correlationId,
                receiptCorrelationId: activeReceipt && activeReceipt.correlationId,
                receiptCount: receiptItems.length };
        }
        if (operation === 'assertCmsSourceRoleBoundary') {
            try {
                await SERVICE.DefaultCmsPublicationTargetService.deploy(Object.assign({}, request, { cmsPublicationTarget: { manifest: {} } }));
                return { rejected: false };
            } catch (error) {
                return { rejected: true, code: error.code || error.name };
            }
        }
        throw new Error('Unsupported runtime publication probe operation: ' + operation);
    },

    /** Collects sanitized observed registry leases directly over test IPC without adding a production route. */
    collectRegistry: async function () {
        let registry = typeof SERVICE !== 'undefined' && SERVICE.DefaultBackofficeRegistryService;
        if (!registry) return { available: false, instances: [] };
        let entries = await registry.getStore().values();
        let discovery = SERVICE.DefaultBackofficeDiscoveryService;
        let availabilityService = SERVICE.DefaultBackofficeAvailabilityService;
        let moduleNames = Array.from(new Set(entries.map(entry => entry.value.moduleName)));
        let snapshots = discovery ? discovery.getSnapshots(moduleNames) : {};
        let repository = SERVICE.DefaultBackofficeContractRepositoryService;
        let systemIdentity = SERVICE.DefaultIdentityGovernanceService && SERVICE.DefaultIdentityGovernanceService.getSystemAuthData ?
            SERVICE.DefaultIdentityGovernanceService.getSystemAuthData() : undefined;
        let discoverableModules = Array.from(new Set(entries.filter(entry => entry.value.backoffice && entry.value.backoffice.discovery)
            .map(entry => entry.value.moduleName)));
        let durableContracts = [];
        let contractPersistenceError;
        if (repository && systemIdentity) {
            for (let moduleName of discoverableModules) {
                try {
                    let active = await repository.getActiveSnapshot(moduleName, { authData: systemIdentity });
                    if (active) durableContracts.push({ moduleName: moduleName, hash: active.contractHash,
                        activationRevision: active.activationRevision, state: active.state });
                } catch (error) {
                    contractPersistenceError = error.code || error.name || 'PERSISTENCE_FAILED';
                    break;
                }
            }
        }
        let availability = moduleNames.sort().map(moduleName => {
            let instances = entries.filter(entry => entry.value.moduleName === moduleName && entry.value.clientCallable).map(entry => entry.value);
            return instances.length > 0 && availabilityService ? Object.assign({ moduleName: moduleName },
                availabilityService.getModuleAvailability(instances)) : undefined;
        }).filter(Boolean);
        let defaultTenant = CONFIG.get('defaultTenant') || 'default';
        let administrativeProbe = { tenant: defaultTenant, requestId: 'test-runtime-contract-probe',
            authData: { tokenType: 'access', tenant: defaultTenant, principalId: 'test-runtime-contract-probe' } };
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
            contractPersistenceServices: Object.keys(SERVICE).filter(name => /Backoffice/i.test(name)).sort(),
            contractPersistenceModels: Object.keys(NODICS.getModels('backoffice', CONFIG.get('defaultTenant') || 'default') || {})
                .filter(name => /Contract(Snapshot|Activation)/i.test(name)).sort(),
            contractPersistenceError: contractPersistenceError,
            durableContracts: durableContracts.sort((left, right) => left.moduleName.localeCompare(right.moduleName)),
            availability: availability,
            diagnostics: (await registry.diagnostics(administrativeProbe)).data
        };
    },

    /** Collects runtime facts and mandatory profile-data availability without returning credentials. */
    collect: async function () {
        const defaultTenant = CONFIG.get('defaultTenant') || 'default';
        const profileModule = CONFIG.get('profileModuleName') || 'profile';
        const profileActive = NODICS.isModuleActive(profileModule);
        let apiContract = { available: false };
        if (SERVICE.DefaultApiContractService && typeof SERVICE.DefaultApiContractService.getOpenApiContract === 'function') {
            try {
                let response = await SERVICE.DefaultApiContractService.getOpenApiContract({ tenant: defaultTenant });
                apiContract = { available: Boolean(response && response.data && response.data.paths) };
            } catch (error) {
                apiContract = { available: false, code: error.code || error.name, message: error.message || String(error) };
            }
        }
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
            apiContract: apiContract,
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
