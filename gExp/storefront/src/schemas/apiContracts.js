/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/schemas/ApiContracts
 * @description Defines public context, secured diagnostics, compatibility, and standard error JSON schemas for generated OpenAPI contracts.
 * @layer schema
 * @owner storefront
 * @override Later modules may add backward-compatible fields while retaining required identity, security, and version semantics.
 */
const stringArray = { type: 'array', uniqueItems: true, items: { type: 'string' } };
const reference = { type: 'object', additionalProperties: true };
const compatibility = {
    type: 'object', additionalProperties: false,
    required: ['clientContractVersion', 'moduleContractVersion', 'minimumClientContractVersion', 'status'],
    properties: {
        clientContractVersion: { type: 'integer', minimum: 1 },
        moduleContractVersion: { type: 'integer', minimum: 1 },
        minimumClientContractVersion: { type: 'integer', minimum: 1 },
        status: { enum: ['COMPATIBLE', 'DEGRADED'] }
    }
};
const errorEnvelope = {
    type: 'object', required: ['code', 'responseCode', 'message'],
    properties: {
        code: { type: 'string' }, responseCode: { type: 'string' }, message: { type: 'string' },
        traceId: { type: 'string' }, details: { type: 'object', additionalProperties: true }
    }
};
const contextData = {
    type: 'object', additionalProperties: false,
    required: ['hostname', 'canonical', 'scheme', 'storefrontCode', 'name', 'cmsSite', 'stores', 'defaultStore',
        'productCatalogCodes', 'countries', 'locales', 'currencies', 'channels', 'defaults', 'downstream', 'contract'],
    properties: {
        hostname: { type: 'string', format: 'hostname' }, canonical: { type: 'boolean' }, scheme: { enum: ['https'] },
        storefrontCode: { type: 'string' }, name: { type: 'string' }, cmsSite: reference,
        stores: stringArray, defaultStore: reference, productCatalogCodes: stringArray,
        defaultProductCatalogCode: { type: 'string' }, countries: stringArray, locales: stringArray,
        currencies: stringArray, channels: stringArray,
        defaults: { type: 'object', additionalProperties: false, properties: {
            country: { type: 'string' }, locale: { type: 'string' }, currency: { type: 'string' }, channel: { type: 'string' }
        } },
        downstream: { type: 'object', additionalProperties: false, required: ['cms', 'product', 'pricing', 'inventory'], properties: {
            cms: { type: 'object', additionalProperties: false, properties: { site: { type: 'string' }, locale: { type: 'string' }, channel: { type: 'string' } } },
            product: { type: 'object', additionalProperties: false, properties: { catalogCode: { type: 'string' }, locale: { type: 'string' } } },
            pricing: { type: 'object', additionalProperties: false, properties: { siteCode: { type: 'string' }, storeCode: { type: 'string' }, currencyCode: { type: 'string' }, channelCode: { type: 'string' } } },
            inventory: { type: 'object', additionalProperties: false, properties: { storeCode: { type: 'string' }, countryCode: { type: 'string' }, channelCode: { type: 'string' } } }
        } },
        contract: compatibility, correlationId: { type: 'string' }
    }
};
const diagnosticsData = {
    type: 'object', additionalProperties: false,
    required: ['assessment', 'configuration', 'dependencies', 'resolution', 'cache', 'traffic'],
    properties: {
        assessment: { type: 'object', required: ['state', 'alerts', 'checkedAt'], properties: {
            state: { enum: ['READY', 'DEGRADED', 'NOT_READY'] }, alerts: stringArray, checkedAt: { type: 'string', format: 'date-time' }
        } },
        configuration: { type: 'object', required: ['valid', 'failures'], properties: { valid: { type: 'boolean' }, failures: stringArray } },
        dependencies: { type: 'object', additionalProperties: false, required: ['cmsSiteReferenceProvider', 'storeReferenceProvider', 'contextCache'], properties: {
            cmsSiteReferenceProvider: { type: 'object' }, storeReferenceProvider: { type: 'object' }, contextCache: { type: 'object' }
        } },
        resolution: { type: 'object' }, cache: { type: 'object' },
        traffic: { type: 'object', additionalProperties: false, required: ['active', 'queued', 'inFlightKeys'], properties: {
            active: { type: 'integer', minimum: 0 }, queued: { type: 'integer', minimum: 0 }, inFlightKeys: { type: 'integer', minimum: 0 }
        } }
    }
};

module.exports = {
    compatibility: compatibility,
    errorEnvelope: errorEnvelope,
    contextData: contextData,
    diagnosticsData: diagnosticsData,
    /** Wraps a route-specific data schema in the standard successful Nodics response envelope. */
    successEnvelope: function (dataSchema) {
        return { type: 'object', required: ['code', 'data'], properties: {
            code: { type: 'string' }, responseCode: { type: 'string' }, message: { type: 'string' }, data: dataSchema
        } };
    }
};
