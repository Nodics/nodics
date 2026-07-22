/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/src/schemas/schemas
 * @description Schema definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    storefront: {
        storefront: {
            super: 'base',
            model: true,
            service: { enabled: true },
            router: { enabled: false },
            event: { enabled: false },
            definition: {
                enterpriseCode: { type: 'string', required: true },
                storefrontCode: { type: 'string', required: true },
                name: { type: 'string', required: true },
                cmsSiteCode: { type: 'string', required: true },
                storeCodes: { type: 'array', required: true },
                defaultStoreCode: { type: 'string', required: true },
                productCatalogCodes: { type: 'array', required: false, default: [] },
                defaultProductCatalogCode: { type: 'string', required: false },
                countryCodes: { type: 'array', required: false, default: [] },
                localeCodes: { type: 'array', required: false, default: [] },
                currencyCodes: { type: 'array', required: false, default: [] },
                channelCodes: { type: 'array', required: false, default: [] },
                defaultLocaleCode: { type: 'string', required: false },
                defaultCountryCode: { type: 'string', required: false },
                defaultCurrencyCode: { type: 'string', required: false },
                defaultChannelCode: { type: 'string', required: false },
                status: { type: 'string', required: true, default: 'DRAFT' },
                effectiveFrom: { type: 'date', required: false },
                effectiveTo: { type: 'date', required: false }
            },
            indexes: {
                common: {
                    enterpriseCode: { enabled: true, name: 'enterpriseCode' },
                    status: { enabled: true, name: 'status' }
                },
                individual: {
                    storefrontCode: { enabled: true, name: 'storefrontCode', options: { unique: true } },
                    cmsSiteCode: { enabled: true, name: 'cmsSiteCode', options: { unique: true } }
                }
            }
        },
        storefrontEndpoint: {
            super: 'base',
            tenants: ['default'],
            model: true,
            service: { enabled: true },
            router: { enabled: false },
            event: { enabled: false },
            definition: {
                hostname: { type: 'string', required: true },
                storefrontCode: { type: 'string', required: true },
                enterpriseCode: { type: 'string', required: true },
                tenantCode: { type: 'string', required: true },
                canonicalKey: { type: 'string', required: false },
                canonical: { type: 'bool', required: true, default: false },
                scheme: { type: 'string', required: true, default: 'https' },
                status: { type: 'string', required: true, default: 'DRAFT' },
                effectiveFrom: { type: 'date', required: false },
                effectiveTo: { type: 'date', required: false }
            },
            indexes: {
                common: {
                    enterpriseCode: { enabled: true, name: 'enterpriseCode' },
                    storefrontCode: { enabled: true, name: 'storefrontCode' },
                    status: { enabled: true, name: 'status' }
                },
                individual: {
                    hostname: { enabled: true, name: 'hostname', options: { unique: true } },
                    canonicalKey: { enabled: true, name: 'canonicalKey', options: { unique: true, sparse: true } }
                }
            }
        }
    }
};
