/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module pricing/src/schemas/schemas @description Versioned Pricing domain schemas. @layer schema @owner pricing */
const governed = function (definition, indexes) {
    return { super: 'base', isVersionedEnabled: false, model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false }, definition: definition, indexes: indexes || {} };
};
const common = function () { return {
    enterpriseCode: { type: 'string', required: true, description: 'Authenticated enterprise owner' },
    status: { type: 'string', required: true, default: 'DRAFT', description: 'Governed lifecycle state' },
    effectiveFrom: { type: 'date', required: false }, effectiveTo: { type: 'date', required: false }
}; };
module.exports = { pricing: {
    priceList: governed(Object.assign(common(), {
        priceListCode: { type: 'string', required: true, description: 'Stable business price-list code' },
        name: { type: 'string', required: true }, description: { type: 'string', required: false },
        priority: { type: 'int', required: true, default: 100 }, currencies: { type: 'array', required: true },
        taxMode: { type: 'string', required: true, default: 'NET' }, stackingMode: { type: 'string', required: true, default: 'EXCLUSIVE' }
    }), { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, priceListCode: { enabled: true, name: 'priceListCode' } }, individual: { priceListCode: { enabled: true, name: 'priceListCode', options: { unique: true } }, status: { enabled: true, name: 'status' } } }),
    priceListAssignment: governed(Object.assign(common(), {
        assignmentCode: { type: 'string', required: true }, priceListCode: { type: 'string', required: true },
        scopeType: { type: 'string', required: true }, scopeCode: { type: 'string', required: true },
        priority: { type: 'int', required: true, default: 100 }, excluded: { type: 'bool', required: true, default: false }
    }), { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, assignmentCode: { enabled: true, name: 'assignmentCode' } }, individual: { assignmentCode: { enabled: true, name: 'assignmentCode', options: { unique: true } }, priceListCode: { enabled: true, name: 'priceListCode' }, scopeType: { enabled: true, name: 'scopeType' }, scopeCode: { enabled: true, name: 'scopeCode' } } }),
    priceGroup: governed(Object.assign(common(), {
        priceGroupCode: { type: 'string', required: true }, name: { type: 'string', required: true }, groupType: { type: 'string', required: true }
    }), { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, priceGroupCode: { enabled: true, name: 'priceGroupCode' } }, individual: { priceGroupCode: { enabled: true, name: 'priceGroupCode', options: { unique: true } }, groupType: { enabled: true, name: 'groupType' } } }),
    priceGroupMember: governed(Object.assign(common(), {
        membershipCode: { type: 'string', required: true }, priceGroupCode: { type: 'string', required: true },
        memberType: { type: 'string', required: true }, memberCode: { type: 'string', required: true }
    }), { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, membershipCode: { enabled: true, name: 'membershipCode' } }, individual: { membershipCode: { enabled: true, name: 'membershipCode', options: { unique: true } }, priceGroupCode: { enabled: true, name: 'priceGroupCode' }, memberCode: { enabled: true, name: 'memberCode' } } }),
    price: governed(Object.assign(common(), {
        priceCode: { type: 'string', required: true }, priceListCode: { type: 'string', required: true },
        itemType: { type: 'string', required: false }, itemCode: { type: 'string', required: false }, itemPriceGroupCode: { type: 'string', required: false },
        customerCode: { type: 'string', required: false }, customerPriceGroupCode: { type: 'string', required: false },
        amount: { type: 'string', required: true, description: 'Exact non-negative decimal-string amount' }, currencyCode: { type: 'string', required: true },
        unitCode: { type: 'string', required: true }, unitFactor: { type: 'int', required: true, default: 1 }, minimumQuantity: { type: 'string', required: true, default: '1' },
        taxMode: { type: 'string', required: false }, channelCode: { type: 'string', required: false }
    }), { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, priceCode: { enabled: true, name: 'priceCode' } }, individual: { priceCode: { enabled: true, name: 'priceCode', options: { unique: true } }, priceListCode: { enabled: true, name: 'priceListCode' }, itemCode: { enabled: true, name: 'itemCode' }, currencyCode: { enabled: true, name: 'currencyCode' }, status: { enabled: true, name: 'status' } } }),
    pricePublicationManifest: { super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false }, definition: {
        publicationCode: { type: 'string', required: true }, rootCode: { type: 'string', required: true }, sourceVersion: { type: 'int', required: true },
        dependencies: { type: 'array', required: true }, snapshot: { type: 'object', required: true }, contentHash: { type: 'string', required: true }, correlationId: { type: 'string', required: false }
    } },
    priceOnlinePointer: { super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false }, definition: {
        enterpriseCode: { type: 'string', required: true }, priceListCode: { type: 'string', required: true }, manifestCode: { type: 'string', required: true },
        previousManifestCode: { type: 'string', required: false }, revision: { type: 'int', required: true, default: 0 }, correlationId: { type: 'string', required: false }
    }, indexes: { composite: { enterpriseCode: { enabled: true, name: 'enterpriseCode', options: { unique: true } }, priceListCode: { enabled: true, name: 'priceListCode', options: { unique: true } } } } },
    pricePublicationReceipt: { super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false }, definition: {
        manifestCode: { type: 'string', required: true }, operation: { type: 'string', required: true }, status: { type: 'string', required: true }, targetVersion: { type: 'string', required: true },
        previousOnlineVersion: { type: 'string', required: false }, correlationId: { type: 'string', required: false }
    } }
} };
