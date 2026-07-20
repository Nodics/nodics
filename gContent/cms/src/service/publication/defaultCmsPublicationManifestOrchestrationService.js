/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const crypto = require('crypto');

/**
 * @module cms/service/publication/DefaultCmsPublicationManifestOrchestrationService
 * @description Builds immutable client-safe CMS manifests and atomically switches tenant-scoped Online pointers.
 * @layer service
 * @owner cms
 * @override Projects may extend manifest projection while preserving exact-version reads, deterministic integrity, and pointer CAS semantics.
 */
module.exports = {
    /** Initializes CMS publication manifests. */
    init: function () { return Promise.resolve(true); },
    /** Completes CMS publication manifest initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Normalizes generated-service results. */
    items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Returns a provider-neutral affected-record count. */
    affected: function (response) {
        let value = response && response.result !== undefined ? response.result : response;
        return value && (value.modifiedCount || value.nModified || value.n || value.result && this.affected(value.result)) || 0;
    },
    /** Maps CMS schema identities to their generated services. */
    serviceFor: function (schema) {
        let names = { cmsPageRoute: 'DefaultCmsPageRouteService', cmsPage: 'DefaultCmsPageService',
            cmsComponentDetail: 'DefaultCmsComponentDetailService', cmsComponent: 'DefaultCmsComponentService',
            cmsPageTemplate: 'DefaultCmsPageTemplateService', cmsSlotDefinition: 'DefaultCmsSlotDefinitionService' };
        if (!names[schema] || !SERVICE[names[schema]]) throw new CLASSES.NodicsError('CMS_PUBLICATION_SERVICE_UNAVAILABLE', 'CMS manifest service is unavailable');
        return SERVICE[names[schema]];
    },
    /** Loads one exact immutable dependency version. */
    load: async function (identity, request) {
        let response = await this.serviceFor(identity.schema).get({ tenant: request.tenant, authData: request.authData,
            query: { code: identity.code, versionId: Number(identity.version), active: true }, searchOptions: { limit: 1 } });
        let model = this.items(response)[0];
        if (!model) throw new CLASSES.NodicsError('CMS_PUBLICATION_DEPENDENCY_MISSING', 'Frozen CMS dependency version is unavailable');
        return model;
    },
    /** Produces a detached client-safe page graph from exact frozen dependencies. */
    buildSnapshot: async function (publication, request) {
        let models = {};
        for (let identity of publication.dependencies || []) models[identity.schema + ':' + identity.code] = await this.load(identity, request);
        let route = models['cmsPageRoute:' + publication.rootCode];
        if (!route) throw new CLASSES.NodicsError('CMS_PUBLICATION_ROUTE_MISSING', 'Frozen CMS route is unavailable');
        let pageCode = route.page && route.page.code || route.page;
        let page = models['cmsPage:' + pageCode];
        if (!page) throw new CLASSES.NodicsError('CMS_PUBLICATION_PAGE_INVALID', 'Frozen CMS page is unavailable');
        let associations = Object.keys(models).filter(key => key.startsWith('cmsComponentDetail:')).map(key => models[key]);
        let components = Object.keys(models).filter(key => key.startsWith('cmsComponent:')).reduce((result, key) => {
            result[models[key].code] = models[key]; return result;
        }, {});
        let build = (source, ancestors) => {
            ancestors = new Set(ancestors || []);
            if (ancestors.has(source)) throw new CLASSES.NodicsError('CMS_PUBLICATION_GRAPH_CYCLE', 'Frozen CMS component graph contains a cycle');
            ancestors.add(source);
            return associations.filter(item => item.source === source).sort((a, b) => Number(a.index || 0) - Number(b.index || 0)).map(item => {
                let code = item.target && item.target.code || item.target;
                let component = components[code];
                if (!component) throw new CLASSES.NodicsError('CMS_PUBLICATION_COMPONENT_MISSING', 'Frozen CMS component is unavailable');
                return { code: component.code, typeCode: component.typeCode, renderer: component.renderer,
                    properties: component.properties, slot: item.slot || 'default', index: Number(item.index || 0), components: build(component.code, ancestors) };
            });
        };
        return { contractVersion: 1, site: route.site, path: route.path, locale: route.locale, channel: route.channel,
            accessMode: route.accessMode, page: { code: page.code, name: page.name, typeCode: page.typeCode,
                template: page.template, renderer: page.renderer, components: build(page.code) } };
    },
    /** Persists one deterministic immutable publication manifest idempotently. */
    persist: async function (publication, request) {
        let snapshot = await this.buildSnapshot(publication, request);
        let content = JSON.stringify({ dependencies: publication.dependencies, snapshot: snapshot });
        let contentHash = crypto.createHash('sha256').update(content).digest('hex');
        let code = publication.code + '_' + publication.sourceVersion;
        let model = { code: code, active: true, publicationCode: publication.code, rootType: publication.rootType,
            rootCode: publication.rootCode, sourceVersion: publication.sourceVersion, dependencies: publication.dependencies,
            snapshot: snapshot, contentHash: contentHash, createdBy: request.authData && (request.authData.principalId || request.authData.code),
            correlationId: request.correlationId || request.requestId };
        let existing = this.items(await SERVICE.DefaultCmsPublicationManifestService.get({ tenant: request.tenant, authData: request.authData,
            query: { code: code }, searchOptions: { limit: 1 } }))[0];
        if (existing) {
            if (existing.contentHash !== contentHash) throw new CLASSES.NodicsError('CMS_PUBLICATION_MANIFEST_CONFLICT', 'Publication manifest identity conflict');
            return existing;
        }
        let response = await SERVICE.DefaultCmsPublicationManifestService.save({ tenant: request.tenant, authData: request.authData, model: model });
        return this.items(response)[0] || response.result || model;
    },
    /** Imports one integrity-checked immutable manifest into the target CMS repository idempotently. */
    importManifest: async function (manifest, request) {
        let content = JSON.stringify({ dependencies: manifest.dependencies, snapshot: manifest.snapshot });
        let hash = crypto.createHash('sha256').update(content).digest('hex');
        if (!manifest.contentHash || hash !== manifest.contentHash) throw new CLASSES.NodicsError('CMS_PUBLICATION_MANIFEST_INTEGRITY', 'CMS publication manifest integrity validation failed');
        let existing = await this.getManifest(manifest.code, request);
        if (existing) {
            if (existing.contentHash !== manifest.contentHash) throw new CLASSES.NodicsError('CMS_PUBLICATION_MANIFEST_CONFLICT', 'Publication manifest identity conflict');
            return existing;
        }
        let safe = { code: manifest.code, active: true, publicationCode: manifest.publicationCode, rootType: manifest.rootType,
            rootCode: manifest.rootCode, sourceVersion: manifest.sourceVersion, dependencies: manifest.dependencies,
            snapshot: manifest.snapshot, contentHash: manifest.contentHash, createdBy: manifest.createdBy,
            correlationId: request.correlationId || request.requestId || manifest.correlationId };
        let response = await SERVICE.DefaultCmsPublicationManifestService.save({ tenant: request.tenant, authData: request.authData, model: safe });
        return this.items(response)[0] || response.result || safe;
    },
    /** Returns the current Online pointer for a route scope. */
    getPointer: async function (route, request) {
        let response = await SERVICE.DefaultCmsOnlinePublicationPointerService.get({ tenant: request.tenant, authData: request.authData,
            query: { site: route.site, path: route.path, locale: route.locale, channel: route.channel, accessMode: route.accessMode },
            searchOptions: { limit: 1 } });
        return this.items(response)[0];
    },
    /** Atomically switches one route scope to an immutable manifest. */
    activate: async function (manifest, request) {
        let scope = manifest.snapshot;
        let current = await this.getPointer(scope, request);
        if (current && current.manifestCode === manifest.code) return { version: manifest.code, previousOnlineVersion: current.previousManifestCode };
        let patch = { manifestCode: manifest.code, previousManifestCode: current && current.manifestCode,
            revision: Number(current && current.revision || 0) + 1,
            activatedBy: request.authData && (request.authData.principalId || request.authData.code), correlationId: request.correlationId || request.requestId };
        if (current) {
            let response = await SERVICE.DefaultCmsOnlinePublicationPointerService.update({ tenant: request.tenant, authData: request.authData,
                query: { code: current.code, revision: Number(current.revision || 0) }, model: patch });
            if (this.affected(response) !== 1) throw new CLASSES.NodicsError('CMS_PUBLICATION_POINTER_CONFLICT', 'CMS Online pointer revision conflict');
        } else {
            let key = [scope.site, scope.path, scope.locale, scope.channel, scope.accessMode].join('|');
            try {
                await SERVICE.DefaultCmsOnlinePublicationPointerService.save({ tenant: request.tenant, authData: request.authData,
                    model: Object.assign({ code: crypto.createHash('sha256').update(key).digest('hex'), active: true,
                        site: scope.site, path: scope.path, locale: scope.locale, channel: scope.channel, accessMode: scope.accessMode }, patch) });
            } catch (error) {
                let winner = await this.getPointer(scope, request);
                if (!winner || winner.manifestCode !== manifest.code) throw error;
                return { version: manifest.code, previousOnlineVersion: winner.previousManifestCode };
            }
        }
        return { version: manifest.code, previousOnlineVersion: current && current.manifestCode };
    },
    /** Loads one immutable manifest by code. */
    getManifest: async function (code, request) {
        let response = await SERVICE.DefaultCmsPublicationManifestService.get({ tenant: request.tenant, authData: request.authData,
            query: { code: code }, searchOptions: { limit: 1 } });
        return this.items(response)[0];
    }
};
