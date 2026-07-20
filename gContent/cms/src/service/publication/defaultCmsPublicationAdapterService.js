/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/service/publication/DefaultCmsPublicationAdapterService
 * @description Resolves and validates immutable CMS page-route dependency graphs for the generic nPublish lifecycle.
 * @layer service
 * @owner cms
 * @override Projects may extend supported CMS root types while preserving exact-version dependency and bounded graph contracts.
 */
module.exports = {
    /** Initializes CMS publication adaptation. */
    init: function () { return Promise.resolve(true); },
    /** Completes CMS publication adaptation initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns effective CMS publication settings. */
    settings: function () { return (CONFIG.get('cms') || {}).publication || {}; },
    /** Resolves one supported root descriptor. */
    descriptor: function (rootType) {
        let descriptor = (this.settings().rootTypes || {})[rootType];
        if (!descriptor) throw this.error('CMS_PUBLICATION_ROOT_UNSUPPORTED', 'Unsupported CMS publication root type');
        return descriptor;
    },
    /** Resolves one generated schema service by configured name. */
    service: function (name) {
        if (!name || !SERVICE[name]) throw this.error('CMS_PUBLICATION_SERVICE_UNAVAILABLE', 'CMS publication schema service is unavailable');
        return SERVICE[name];
    },
    /** Normalizes generated-service results. */
    items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Loads an exact immutable CMS version. */
    getVersion: async function (publication, request) {
        let descriptor = this.descriptor(publication.rootType);
        let response = await this.service(descriptor.service).get({ tenant: request.tenant, authData: request.authData,
            query: { code: publication.rootCode, versionId: Number(publication.sourceVersion), active: true }, searchOptions: { limit: 1 } });
        let version = this.items(response)[0];
        if (!version) throw this.error('CMS_PUBLICATION_VERSION_NOT_FOUND', 'CMS source version was not found');
        return version;
    },
    /** Selects the latest version for each stable code from generated-service results. */
    latestByCode: function (items) {
        return Array.from(items.reduce((result, item) => {
            let current = result.get(item.code);
            if (!current || Number(item.versionId || 0) > Number(current.versionId || 0)) result.set(item.code, item);
            return result;
        }, new Map()).values());
    },
    /** Loads active models and collapses version history to exact latest identities. */
    loadLatest: async function (serviceName, request, query) {
        let response = await this.service(serviceName).get({ tenant: request.tenant, authData: request.authData,
            query: Object.assign({ active: true }, query), searchOptions: { sort: { versionId: -1 } } });
        return this.latestByCode(this.items(response));
    },
    /** Converts one model into a frozen dependency identity. */
    identity: function (schema, model) {
        return { schema: schema, code: model.code, version: String(model.versionId) };
    },
    /** Resolves the bounded exact-version graph owned by one page route. */
    resolveDependencies: async function (publication, rootVersion, request) {
        let settings = this.settings();
        let max = Number(settings.maxDependencies || 500);
        let dependencies = [this.identity(this.descriptor(publication.rootType).schema, rootVersion)];
        let pages = await this.loadLatest('DefaultCmsPageService', request, { code: rootVersion.page });
        if (pages.length !== 1) throw this.error('CMS_PUBLICATION_PAGE_INVALID', 'Published route must resolve exactly one page');
        dependencies.push(this.identity('cmsPage', pages[0]));
        let frontier = [pages[0].code];
        let visited = new Set();
        for (let depth = 0; frontier.length; depth++) {
            if (depth >= Number(settings.maxDepth || 12)) throw this.error('CMS_PUBLICATION_DEPTH_EXCEEDED', 'CMS publication graph exceeds configured depth');
            let sources = frontier.filter(code => !visited.has(code));
            if (!sources.length) break;
            sources.forEach(code => visited.add(code));
            let associations = await this.loadLatest('DefaultCmsComponentDetailService', request, { source: { $in: sources } });
            associations.forEach(model => dependencies.push(this.identity('cmsComponentDetail', model)));
            let targets = Array.from(new Set(associations.map(item => item.target && item.target.code || item.target).filter(Boolean)));
            let components = targets.length ? await this.loadLatest('DefaultCmsComponentService', request, { code: { $in: targets } }) : [];
            components.forEach(model => dependencies.push(this.identity('cmsComponent', model)));
            frontier = components.map(model => model.code);
            if (dependencies.length > max) throw this.error('CMS_PUBLICATION_DEPENDENCY_EXCEEDED', 'CMS publication graph exceeds configured size');
        }
        if (pages[0].template) {
            let templates = await this.loadLatest('DefaultCmsPageTemplateService', request, { code: pages[0].template });
            templates.forEach(model => dependencies.push(this.identity('cmsPageTemplate', model)));
            let slots = templates.length ? await this.loadLatest('DefaultCmsSlotDefinitionService', request, { template: templates[0].code }) : [];
            slots.forEach(model => dependencies.push(this.identity('cmsSlotDefinition', model)));
        }
        if (dependencies.length > max) throw this.error('CMS_PUBLICATION_DEPENDENCY_EXCEEDED', 'CMS publication graph exceeds configured size');
        return Array.from(dependencies.reduce((result, item) => {
            result.set(item.schema + ':' + item.code + ':' + item.version, item); return result;
        }, new Map()).values());
    },
    /** Validates route, graph identity uniqueness, and renderer contracts. */
    validate: async function (publication, rootVersion, request, dependencies) {
        await SERVICE.DefaultCmsContractValidationService.validateRoute({ model: Object.assign({}, rootVersion) });
        let keys = (dependencies || []).map(item => item.schema + ':' + item.code + ':' + item.version);
        if (!keys.length || keys.length !== new Set(keys).size) return { valid: false, reason: 'DEPENDENCY_IDENTITY_INVALID' };
        for (let identity of dependencies) {
            let serviceNames = { cmsPageRoute: 'DefaultCmsPageRouteService', cmsPage: 'DefaultCmsPageService',
                cmsComponentDetail: 'DefaultCmsComponentDetailService', cmsComponent: 'DefaultCmsComponentService',
                cmsPageTemplate: 'DefaultCmsPageTemplateService', cmsSlotDefinition: 'DefaultCmsSlotDefinitionService' };
            let response = await this.service(serviceNames[identity.schema]).get({ tenant: request.tenant, authData: request.authData,
                query: { code: identity.code, versionId: Number(identity.version), active: true }, searchOptions: { limit: 1 } });
            let model = this.items(response)[0];
            if (!model) return { valid: false, reason: 'DEPENDENCY_VERSION_MISSING' };
            if (model.renderer) await SERVICE.DefaultCmsContractValidationService.validateRenderer({ model: { renderer: model.renderer } });
        }
        return { valid: Boolean(rootVersion.code && rootVersion.page && rootVersion.site && rootVersion.path),
            rootVersion: rootVersion.versionId, dependencyCount: keys.length };
    },
    /** Invalidates CMS delivery cache after activation. */
    afterActivate: function (publication, activation, request) {
        return SERVICE.DefaultCmsDeliveryCacheInvalidationService.invalidate(request);
    },
    /** Invalidates CMS delivery cache after rollback. */
    afterRollback: function (publication, activation, request) {
        return SERVICE.DefaultCmsDeliveryCacheInvalidationService.invalidate(request);
    },
    /** Creates a stable CMS publication error. */
    error: function (code, message) {
        let error = new CLASSES.NodicsError(code, message); error.code = error.code || code; return error;
    }
};
