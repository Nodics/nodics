/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module cms/service/delivery/defaultCmsDeliveryService
 * @description Resolves a bounded, tenant-aware, client-safe CMS page graph using generated CMS schema services.
 * @layer service
 * @owner cms
 * @override Later modules may replace individual methods to customize routing, projection, or graph resolution.
 */
module.exports = {
    /** Initializes the delivery service lifecycle. */
    init: function () { return Promise.resolve(true); },
    /** Completes the delivery service lifecycle. */
    postInit: function () { return Promise.resolve(true); },

    /** Resolves one route into a versioned client-safe page graph. */
    resolvePage: async function (request) {
        let context = this.normalizeContext(request);
        let isPublic = request.router && request.router.publicAccess === true;
        if ((((CONFIG.get('cms') || {}).publication || {}).enabled) === true) return this.resolvePublishedManifest(request, context, isPublic);
        let route = await this.getSingle(SERVICE.DefaultCmsPageRouteService, request, {
            site: context.site,
            path: context.path,
            locale: context.locale,
            channel: context.channel,
            deliveryState: 'ONLINE',
            accessMode: isPublic ? 'PUBLIC' : 'AUTHENTICATED',
            active: true
        }, 'CMS_ROUTE_NOT_FOUND');
        if (route.routeType === 'REDIRECT') {
            return { result: { contractVersion: 1, type: 'REDIRECT', path: context.path, redirectPath: route.redirectPath } };
        }
        let pageCode = this.codeOf(route.page);
        let page = await this.getSingle(SERVICE.DefaultCmsPageService, request, { code: pageCode, active: true }, 'CMS_PAGE_NOT_FOUND');
        let templateCode = this.codeOf(page.template);
        let template = templateCode ? await this.getSingle(SERVICE.DefaultCmsPageTemplateService, request,
            { code: templateCode, active: true }, 'CMS_PAGE_TEMPLATE_NOT_FOUND') : undefined;
        let graph = await this.resolveGraph(request, [page.code], isPublic ? 'PUBLIC' : 'AUTHENTICATED');
        return {
            result: {
                contractVersion: 1,
                site: context.site,
                path: context.path,
                locale: context.locale,
                channel: context.channel,
                page: this.projectPage(page, template, graph[page.code] || [])
            }
        };
    },

    /** Resolves delivery exclusively through the configured immutable Online manifest authority. */
    resolvePublishedManifest: async function (request, context, isPublic) {
        let pointer = await this.getSingle(SERVICE.DefaultCmsOnlinePublicationPointerService, request, {
            site: context.site, path: context.path, locale: context.locale, channel: context.channel,
            accessMode: isPublic ? 'PUBLIC' : 'AUTHENTICATED', active: true
        }, 'CMS_PUBLICATION_POINTER_NOT_FOUND');
        let manifest = await this.getSingle(SERVICE.DefaultCmsPublicationManifestService, request,
            { code: pointer.manifestCode, active: true }, 'CMS_PUBLICATION_MANIFEST_NOT_FOUND');
        return { result: manifest.snapshot };
    },

    /** Validates and normalizes site, path, locale, and channel input. */
    normalizeContext: function (request) {
        let input = request.delivery || {};
        let settings = this.settings();
        if (!input.site || !input.path) throw this.error('CMS_DELIVERY_CONTEXT_INVALID', 'site and path are required');
        if (typeof input.path !== 'string' || input.path.charAt(0) !== '/' || input.path.includes('://')) {
            throw this.error('CMS_DELIVERY_PATH_INVALID', 'path must be an absolute application path');
        }
        return {
            site: String(input.site),
            path: input.path.replace(/\/+/g, '/'),
            locale: String(input.locale || settings.defaultLocale),
            channel: String(input.channel || settings.defaultChannel)
        };
    },

    /** Resolves component associations breadth-first within configured bounds. */
    resolveGraph: async function (request, rootCodes, accessMode) {
        let settings = this.settings();
        let graph = {};
        let visited = new Set();
        let frontier = rootCodes.slice();
        let count = 0;
        for (let depth = 0; frontier.length > 0; depth++) {
            let sources = frontier.filter(code => code && !visited.has(code));
            if (sources.length === 0) break;
            if (depth >= settings.maxDepth) throw this.error('CMS_GRAPH_DEPTH_EXCEEDED', 'component graph exceeds configured depth');
            sources.forEach(code => visited.add(code));
            let associations = await this.getMany(SERVICE.DefaultCmsComponentDetailService, request, {
                source: { $in: sources }, active: true
            });
            associations.sort((left, right) => (left.index || 0) - (right.index || 0));
            let targetCodes = Array.from(new Set(associations.map(item => this.codeOf(item.target)).filter(Boolean)));
            count += targetCodes.length;
            if (count > settings.maxComponents) throw this.error('CMS_GRAPH_SIZE_EXCEEDED', 'component graph exceeds configured size');
            let components = targetCodes.length ? await this.getMany(SERVICE.DefaultCmsComponentService, request, {
                code: { $in: targetCodes }, active: true
            }) : [];
            if (accessMode === 'PUBLIC' && components.some(component => component.accessMode !== 'PUBLIC')) {
                throw this.error('CMS_COMPONENT_ACCESS_DENIED', 'public page composition contains protected content');
            }
            let byCode = components.reduce((result, component) => {
                result[component.code] = component;
                return result;
            }, {});
            sources.forEach(source => {
                graph[source] = associations.filter(item => item.source === source).map(item => {
                    let target = byCode[this.codeOf(item.target)];
                    return target ? this.projectComponent(target, item) : null;
                }).filter(Boolean);
            });
            frontier = components.map(component => component.code);
        }
        Object.keys(graph).forEach(source => {
            graph[source].forEach(component => { component.components = graph[component.code] || []; });
        });
        return graph;
    },

    /** Loads exactly one active record or throws a stable identity error. */
    getSingle: async function (service, request, query, code) {
        let models = await this.getMany(service, request, query);
        if (models.length !== 1) throw this.error(code, models.length ? 'content identity is ambiguous' : 'content was not found');
        return models[0];
    },

    /** Loads records through an existing generated schema service. */
    getMany: async function (service, request, query) {
        let response = await service.get({
            tenant: request.tenant,
            authData: request.authData,
            options: Object.assign({}, request.options || {}, { recursive: false }),
            query: query
        });
        return response && Array.isArray(response.result) ? response.result : [];
    },

    /** Projects safe page fields and resolved components. */
    projectPage: function (page, template, components) {
        let result = this.pickDefined(page, ['code', 'name', 'typeCode', 'template', 'renderer', 'rendererContractVersion',
            'rendererChannels', 'rendererDeprecated', 'rendererReplacement']);
        if (template) {
            result.templateContract = this.pickDefined(template, ['code', 'renderer', 'contractVersion']);
        }
        return Object.assign(result, { components: components });
    },

    /** Projects safe component and association fields. */
    projectComponent: function (component, association) {
        let result = this.pickDefined(component, ['code', 'typeCode', 'renderer', 'rendererContractVersion',
            'rendererChannels', 'rendererDeprecated', 'rendererReplacement', 'properties']);
        return Object.assign(result, { slot: association.slot || 'default', index: association.index || 0, components: [] });
    },

    /** Copies only defined allowlisted fields into a detached object. */
    pickDefined: function (source, fields) {
        let value = {};
        fields.forEach(field => { if (source[field] !== undefined) value[field] = _.cloneDeep(source[field]); });
        return value;
    },

    /** Normalizes a reference object or scalar into its stable code. */
    codeOf: function (value) {
        return value && typeof value === 'object' ? value.code : value;
    },

    /** Returns effective layered delivery limits and defaults. */
    settings: function () {
        let configured = typeof CONFIG !== 'undefined' && CONFIG.get ? (CONFIG.get('cms') || {}).delivery : {};
        return Object.assign({ defaultLocale: 'default', defaultChannel: 'web', maxDepth: 12, maxComponents: 500 }, configured || {});
    },

    /** Creates a stable CMS delivery error. */
    error: function (code, message) {
        let error = typeof CLASSES !== 'undefined' && CLASSES.NodicsError ? new CLASSES.NodicsError(code, message) : new Error(message);
        error.code = error.code || code;
        return error;
    }
};
