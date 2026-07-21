/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module store/src/schemas/schemas
 * @description Schema definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    store: {
        store: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                enterpriseCode: { type: 'string', required: true, description: 'Authoritative enterprise owning the store' },
                storeCode: { type: 'string', required: true, description: 'Stable business store code unique inside the enterprise' },
                name: { type: 'string', required: true, description: 'Business-facing store name' },
                type: { type: 'string', required: true, default: 'PHYSICAL', description: 'Configured physical or digital store classification' },
                status: { type: 'string', required: true, default: 'DRAFT', description: 'Governed store lifecycle state' },
                countryCode: { type: 'string', required: false, description: 'Country served by a physical or country-bound store' },
                timezone: { type: 'string', required: false, description: 'IANA timezone used for store operations' },
                addressRef: { type: 'string', required: false, description: 'Reference to an address owned by an approved address provider' },
                channels: { type: 'array', required: false, default: [], description: 'Descriptive sales or experience channels supported by the store' },
                capabilities: { type: 'array', required: false, default: [], description: 'Configured store capabilities without inventory authority' },
                externalReferences: { type: 'object', required: false, description: 'Non-secret external commerce, POS, ERP, or facility identifiers' },
                effectiveFrom: { type: 'date', required: false }, effectiveTo: { type: 'date', required: false }
            },
            indexes: { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' } }, individual: {
                storeCode: { enabled: true, name: 'storeCode', options: { unique: true } },
                status: { enabled: true, name: 'status' }, countryCode: { enabled: true, name: 'countryCode' } } }
        },
        storeWarehouseAssignment: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                enterpriseCode: { type: 'string', required: true, description: 'Enterprise owning both sides of the association' },
                storeCode: { type: 'string', required: true, description: 'Store business code' },
                warehouseCode: { type: 'string', required: true, description: 'Inventory-owned warehouse business code' },
                status: { type: 'string', required: true, default: 'DRAFT', description: 'Governed association lifecycle state' },
                purposes: { type: 'array', required: true, description: 'Configured reasons this warehouse serves the store' },
                priority: { type: 'int', required: true, default: 100, description: 'Lower value gives earlier consideration for the same purpose' },
                effectiveFrom: { type: 'date', required: false }, effectiveTo: { type: 'date', required: false }
            },
            indexes: { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' },
                storeCode: { enabled: true, name: 'storeCode' } }, individual: {
                warehouseCode: { enabled: true, name: 'warehouseCode', options: { unique: true } },
                status: { enabled: true, name: 'status' }, priority: { enabled: true, name: 'priority' } } }
        }
    }
};
