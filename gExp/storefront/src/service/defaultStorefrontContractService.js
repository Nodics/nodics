/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
const crypto = require('crypto');

/**
 * @module storefront/service/DefaultStorefrontContractService
 * @description Negotiates the additive public Storefront contract and applies runtime-configurable cache, version, request-id, ETag, and retry headers.
 * @layer service
 * @owner storefront
 * @override Projects may extend compatibility or headers while preserving optional negotiation, stable major versions, and secret-safe values.
 */
module.exports = {
    /** Initializes Storefront delivery-contract behavior. */
    init: function () { return Promise.resolve(true); },
    /** Completes Storefront delivery-contract initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Reads the latest effective runtime delivery policy. */
    policy: function () { return ((CONFIG.get('storefront') || {}).deliveryContract) || {}; },
    /** Reads one HTTP header from Nodics or direct-test request shapes. */
    header: function (request, name) {
        let httpRequest = request && request.httpRequest, lower = String(name).toLowerCase();
        if (httpRequest && typeof httpRequest.get === 'function') return httpRequest.get(name);
        let headers = httpRequest && httpRequest.headers || request && request.headers || {};
        return headers[lower] || headers[name];
    },
    /** Evaluates optional client major-version compatibility and rejects obsolete clients. */
    compatibility: function (request) {
        let policy = this.policy(), current = Number(policy.contractVersion || 1), minimum = Number(policy.minimumClientContractVersion || 1);
        let raw = this.header(request, policy.requestHeader || 'x-nodics-client-contract-version');
        let client = raw === undefined || raw === null || raw === '' ? minimum : Number(raw);
        if (!Number.isInteger(client) || client < 1)
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error('ERR_STOREFRONT_00012', 'Client contract version is invalid');
        if (client < minimum)
            throw SERVICE.DefaultStorefrontEnterpriseScopeService.error('ERR_STOREFRONT_00015', 'Client contract version is no longer supported');
        return { clientContractVersion: client, moduleContractVersion: current, minimumClientContractVersion: minimum,
            status: client <= current ? 'COMPATIBLE' : 'DEGRADED' };
    },
    /** Creates a weak deterministic ETag from the client-safe response only. */
    etag: function (data) { return 'W/"' + crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex') + '"'; },
    /** Sets one response header when an HTTP response exists. */
    setHeader: function (request, name, value) {
        if (request && request.httpResponse && typeof request.httpResponse.setHeader === 'function' && value !== undefined) {
            request.httpResponse.setHeader(name, String(value));
        }
        return true;
    },
    /** Decorates resolved context and applies delivery headers after cache lookup. */
    decorate: function (request, value) {
        let policy = this.policy(), stable = Object.assign({}, value, { contract: this.compatibility(request) });
        let data = Object.assign({}, stable, { correlationId: request && (request.correlationId || request.requestId) });
        if (data.correlationId === undefined) delete data.correlationId;
        this.setHeader(request, policy.responseHeader || 'x-nodics-storefront-contract-version', data.contract.moduleContractVersion);
        this.setHeader(request, policy.requestIdHeader || 'x-request-id', request && (request.correlationId || request.requestId));
        this.setHeader(request, 'Cache-Control', policy.cacheControl || 'private, max-age=0, must-revalidate');
        let etag = policy.etagEnabled === false ? null : this.etag(stable);
        if (etag) this.setHeader(request, 'ETag', etag);
        return { data: data, etag: etag, notModified: Boolean(etag && this.header(request, 'if-none-match') === etag) };
    },
    /** Applies a runtime-configurable Retry-After header for Storefront capacity rejection. */
    applyRetryAfter: function (request) {
        this.setHeader(request, 'Retry-After', Math.max(1, Number(this.policy().retryAfterSeconds || 1)));
        return true;
    }
};
