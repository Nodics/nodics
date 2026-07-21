/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module product/schemas @description Defines Product Item, Identifier, Category, classification, and typed-attribute persistence contracts. @layer schema @owner product */
const governed = function (definition, indexes) {
    return { super: 'base', isVersionedEnabled: false, model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false }, definition: definition, indexes: indexes };
};
const common = function () { return {
    enterpriseCode: { type: 'string', required: true, description: 'Authenticated enterprise owner' },
    catalogCode: { type: 'string', required: true, description: 'nCatalog-owned catalog identity' },
    status: { type: 'string', required: true, default: 'DRAFT', description: 'Governed lifecycle status' }
}; };
module.exports = { product: {
    productItem: governed(Object.assign(common(), {
        itemType: { type: 'string', required: true, description: 'Configured Product item classification' },
        itemCode: { type: 'string', required: true, description: 'Stable business item identity' },
        name: { type: 'string', required: true }, description: { type: 'string', required: false },
        baseUnitCode: { type: 'string', required: false, description: 'Units-owned base Unit reference' },
        sellable: { type: 'bool', required: true, default: false }, stockManaged: { type: 'bool', required: true, default: false }
    }), { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, catalogCode: { enabled: true, name: 'catalogCode' }, itemType: { enabled: true, name: 'itemType' }, itemCode: { enabled: true, name: 'itemCode' } }, individual: { itemCode: { enabled: true, name: 'itemCode' }, itemType: { enabled: true, name: 'itemType' }, catalogCode: { enabled: true, name: 'catalogCode' }, status: { enabled: true, name: 'status' } } }),
    productIdentifier: governed(Object.assign(common(), {
        identifierCode: { type: 'string', required: true, description: 'Stable identifier-record identity' },
        itemType: { type: 'string', required: true }, itemCode: { type: 'string', required: true },
        identifierType: { type: 'string', required: true }, identifierValue: { type: 'string', required: true },
        primary: { type: 'bool', required: true, default: false }
    }), { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, catalogCode: { enabled: true, name: 'catalogCode' }, identifierCode: { enabled: true, name: 'identifierCode' } }, individual: { identifierCode: { enabled: true, name: 'identifierCode' }, itemCode: { enabled: true, name: 'itemCode' }, identifierType: { enabled: true, name: 'identifierType' }, identifierValue: { enabled: true, name: 'identifierValue' }, status: { enabled: true, name: 'status' } } }),
    productCategory: governed(Object.assign(common(), {
        categoryCode: { type: 'string', required: true, description: 'Stable business category identity inside one Catalog' },
        name: { type: 'string', required: true }, description: { type: 'string', required: false },
        parentCategoryCode: { type: 'string', required: false, description: 'Optional Product-owned parent Category in the same Catalog' },
        order: { type: 'int', required: true, default: 100 }, navigable: { type: 'bool', required: true, default: true },
        effectiveFrom: { type: 'date', required: false }, effectiveTo: { type: 'date', required: false }
    }), { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, catalogCode: { enabled: true, name: 'catalogCode' }, categoryCode: { enabled: true, name: 'categoryCode' } }, individual: { categoryCode: { enabled: true, name: 'categoryCode' }, parentCategoryCode: { enabled: true, name: 'parentCategoryCode' }, status: { enabled: true, name: 'status' }, order: { enabled: true, name: 'order' } } }),
    productCategoryAssignment: governed(Object.assign(common(), {
        assignmentCode: { type: 'string', required: true, description: 'Stable Item-to-Category assignment identity' },
        categoryCode: { type: 'string', required: true }, itemType: { type: 'string', required: true }, itemCode: { type: 'string', required: true },
        position: { type: 'int', required: true, default: 100 }, primary: { type: 'bool', required: true, default: false },
        effectiveFrom: { type: 'date', required: false }, effectiveTo: { type: 'date', required: false }
    }), { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, catalogCode: { enabled: true, name: 'catalogCode' }, assignmentCode: { enabled: true, name: 'assignmentCode' } }, individual: { assignmentCode: { enabled: true, name: 'assignmentCode' }, categoryCode: { enabled: true, name: 'categoryCode' }, itemCode: { enabled: true, name: 'itemCode' }, status: { enabled: true, name: 'status' }, position: { enabled: true, name: 'position' } } }),
    productAttributeDefinition: governed(Object.assign(common(), {
        attributeCode: { type: 'string', required: true, description: 'Stable typed-attribute identity' },
        name: { type: 'string', required: true }, description: { type: 'string', required: false }, valueType: { type: 'string', required: true },
        localized: { type: 'bool', required: true, default: false }, multiValued: { type: 'bool', required: true, default: false }, required: { type: 'bool', required: true, default: false },
        minimumValues: { type: 'int', required: true, default: 0 }, maximumValues: { type: 'int', required: true, default: 1 },
        enumerationValues: { type: 'array', required: false, default: [] }, unitRequired: { type: 'bool', required: true, default: false }
    }), { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, catalogCode: { enabled: true, name: 'catalogCode' }, attributeCode: { enabled: true, name: 'attributeCode' } }, individual: { attributeCode: { enabled: true, name: 'attributeCode' }, valueType: { enabled: true, name: 'valueType' }, status: { enabled: true, name: 'status' } } }),
    productAttributeValue: governed(Object.assign(common(), {
        valueCode: { type: 'string', required: true, description: 'Stable value-record identity' },
        itemType: { type: 'string', required: true }, itemCode: { type: 'string', required: true }, attributeCode: { type: 'string', required: true },
        localeCode: { type: 'string', required: false }, ordinal: { type: 'int', required: true, default: 0 },
        stringValue: { type: 'string', required: false }, booleanValue: { type: 'bool', required: false }, integerValue: { type: 'string', required: false },
        decimalValue: { type: 'string', required: false }, dateValue: { type: 'date', required: false },
        referenceType: { type: 'string', required: false }, referenceItemType: { type: 'string', required: false }, referenceCode: { type: 'string', required: false }, unitCode: { type: 'string', required: false }
    }), { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, catalogCode: { enabled: true, name: 'catalogCode' }, valueCode: { enabled: true, name: 'valueCode' } }, individual: { valueCode: { enabled: true, name: 'valueCode' }, itemCode: { enabled: true, name: 'itemCode' }, attributeCode: { enabled: true, name: 'attributeCode' }, localeCode: { enabled: true, name: 'localeCode' }, status: { enabled: true, name: 'status' } } }),
    productClassificationClass: governed(Object.assign(common(), {
        classCode: { type: 'string', required: true, description: 'Stable Product classification identity' },
        name: { type: 'string', required: true }, description: { type: 'string', required: false },
        attributeCodes: { type: 'array', required: true }, requiredAttributeCodes: { type: 'array', required: false, default: [] }
    }), { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, catalogCode: { enabled: true, name: 'catalogCode' }, classCode: { enabled: true, name: 'classCode' } }, individual: { classCode: { enabled: true, name: 'classCode' }, status: { enabled: true, name: 'status' } } }),
    productClassificationAssignment: governed(Object.assign(common(), {
        assignmentCode: { type: 'string', required: true, description: 'Stable Item-to-class assignment identity' },
        classCode: { type: 'string', required: true }, itemType: { type: 'string', required: true }, itemCode: { type: 'string', required: true },
        effectiveFrom: { type: 'date', required: false }, effectiveTo: { type: 'date', required: false }
    }), { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, catalogCode: { enabled: true, name: 'catalogCode' }, assignmentCode: { enabled: true, name: 'assignmentCode' } }, individual: { assignmentCode: { enabled: true, name: 'assignmentCode' }, classCode: { enabled: true, name: 'classCode' }, itemCode: { enabled: true, name: 'itemCode' }, status: { enabled: true, name: 'status' } } }),
    productVariantAxis: governed(Object.assign(common(), {
        axisCode: { type: 'string', required: true, description: 'Stable axis identity for one base Product Item' },
        baseItemType: { type: 'string', required: true }, baseItemCode: { type: 'string', required: true },
        attributeCode: { type: 'string', required: true, description: 'Existing Product Attribute Definition used by this axis' },
        position: { type: 'int', required: true, default: 100 }, required: { type: 'bool', required: true, default: true }
    }), { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, catalogCode: { enabled: true, name: 'catalogCode' }, axisCode: { enabled: true, name: 'axisCode' } }, individual: { axisCode: { enabled: true, name: 'axisCode' }, baseItemCode: { enabled: true, name: 'baseItemCode' }, attributeCode: { enabled: true, name: 'attributeCode' }, position: { enabled: true, name: 'position' }, status: { enabled: true, name: 'status' } } }),
    productVariantAssignment: governed(Object.assign(common(), {
        assignmentCode: { type: 'string', required: true, description: 'Stable base-to-variant association identity' },
        baseItemType: { type: 'string', required: true }, baseItemCode: { type: 'string', required: true },
        variantItemType: { type: 'string', required: true }, variantItemCode: { type: 'string', required: true },
        axisValues: { type: 'array', required: true, description: 'Axis-code and Product Attribute Value-code pairs' },
        combinationKey: { type: 'string', required: true, description: 'Server-derived canonical variant combination identity' }
    }), { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, catalogCode: { enabled: true, name: 'catalogCode' }, assignmentCode: { enabled: true, name: 'assignmentCode' } }, individual: { assignmentCode: { enabled: true, name: 'assignmentCode' }, baseItemCode: { enabled: true, name: 'baseItemCode' }, variantItemCode: { enabled: true, name: 'variantItemCode' }, combinationKey: { enabled: true, name: 'combinationKey' }, status: { enabled: true, name: 'status' } } }),
    productRelation: governed(Object.assign(common(), {
        relationCode: { type: 'string', required: true }, relationType: { type: 'string', required: true },
        sourceItemType: { type: 'string', required: true }, sourceItemCode: { type: 'string', required: true },
        targetCatalogCode: { type: 'string', required: true }, targetItemType: { type: 'string', required: true }, targetItemCode: { type: 'string', required: true },
        position: { type: 'int', required: true, default: 100 }, effectiveFrom: { type: 'date', required: false }, effectiveTo: { type: 'date', required: false }
    }), { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, catalogCode: { enabled: true, name: 'catalogCode' }, relationCode: { enabled: true, name: 'relationCode' } }, individual: { relationCode: { enabled: true, name: 'relationCode' }, sourceItemCode: { enabled: true, name: 'sourceItemCode' }, targetItemCode: { enabled: true, name: 'targetItemCode' }, relationType: { enabled: true, name: 'relationType' }, status: { enabled: true, name: 'status' } } }),
    productBundleEntry: governed(Object.assign(common(), {
        entryCode: { type: 'string', required: true }, bundleItemType: { type: 'string', required: true }, bundleItemCode: { type: 'string', required: true },
        componentItemType: { type: 'string', required: true }, componentItemCode: { type: 'string', required: true }, quantity: { type: 'string', required: true }, unitCode: { type: 'string', required: true },
        position: { type: 'int', required: true, default: 100 }, optional: { type: 'bool', required: true, default: false }
    }), { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, catalogCode: { enabled: true, name: 'catalogCode' }, entryCode: { enabled: true, name: 'entryCode' } }, individual: { entryCode: { enabled: true, name: 'entryCode' }, bundleItemCode: { enabled: true, name: 'bundleItemCode' }, componentItemCode: { enabled: true, name: 'componentItemCode' }, position: { enabled: true, name: 'position' }, status: { enabled: true, name: 'status' } } }),
    productPackaging: governed(Object.assign(common(), {
        packagingCode: { type: 'string', required: true }, itemType: { type: 'string', required: true }, itemCode: { type: 'string', required: true }, packageType: { type: 'string', required: true },
        containedQuantity: { type: 'string', required: true }, containedUnitCode: { type: 'string', required: true },
        length: { type: 'string', required: false }, width: { type: 'string', required: false }, height: { type: 'string', required: false }, dimensionUnitCode: { type: 'string', required: false },
        weight: { type: 'string', required: false }, weightUnitCode: { type: 'string', required: false }, position: { type: 'int', required: true, default: 100 }
    }), { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, catalogCode: { enabled: true, name: 'catalogCode' }, packagingCode: { enabled: true, name: 'packagingCode' } }, individual: { packagingCode: { enabled: true, name: 'packagingCode' }, itemCode: { enabled: true, name: 'itemCode' }, packageType: { enabled: true, name: 'packageType' }, position: { enabled: true, name: 'position' }, status: { enabled: true, name: 'status' } } }),
    productMediaReference: governed(Object.assign(common(), {
        mediaCode: { type: 'string', required: true }, itemType: { type: 'string', required: true }, itemCode: { type: 'string', required: true },
        mediaType: { type: 'string', required: true }, role: { type: 'string', required: true }, uri: { type: 'string', required: true }, localeCode: { type: 'string', required: false },
        position: { type: 'int', required: true, default: 100 }, altText: { type: 'string', required: false }
    }), { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, catalogCode: { enabled: true, name: 'catalogCode' }, mediaCode: { enabled: true, name: 'mediaCode' } }, individual: { mediaCode: { enabled: true, name: 'mediaCode' }, itemCode: { enabled: true, name: 'itemCode' }, mediaType: { enabled: true, name: 'mediaType' }, role: { enabled: true, name: 'role' }, position: { enabled: true, name: 'position' }, status: { enabled: true, name: 'status' } } }),
    productReleaseManifest: { super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false }, definition: { publicationCode: { type: 'string', required: true }, rootCode: { type: 'string', required: true }, sourceVersion: { type: 'int', required: true }, dependencies: { type: 'array', required: true }, snapshot: { type: 'object', required: true }, contentHash: { type: 'string', required: true }, correlationId: { type: 'string', required: false } } },
    productOnlinePointer: { super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false }, definition: { enterpriseCode: { type: 'string', required: true }, catalogCode: { type: 'string', required: true }, manifestCode: { type: 'string', required: true }, previousManifestCode: { type: 'string', required: false }, revision: { type: 'int', required: true, default: 0 }, correlationId: { type: 'string', required: false } }, indexes: { composite: { enterpriseCode: { enabled: true, name: 'enterpriseCode', options: { unique: true } }, catalogCode: { enabled: true, name: 'catalogCode', options: { unique: true } } } } },
    productPublicationReceipt: { super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false }, definition: { manifestCode: { type: 'string', required: true }, operation: { type: 'string', required: true }, status: { type: 'string', required: true }, targetVersion: { type: 'string', required: true }, previousOnlineVersion: { type: 'string', required: false }, correlationId: { type: 'string', required: false } } }
    ,productProjectionJob: { super: 'base', isVersionedEnabled: false, model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false }, definition: { enterpriseCode: { type: 'string', required: true }, catalogCode: { type: 'string', required: true }, manifestCode: { type: 'string', required: true }, operation: { type: 'string', required: true }, state: { type: 'string', required: true }, cacheState: { type: 'string', required: true }, searchState: { type: 'string', required: true }, attempts: { type: 'int', required: true, default: 0 }, lastErrorCode: { type: 'string', required: false }, correlationId: { type: 'string', required: false }, lastAttemptAt: { type: 'date', required: false }, completedAt: { type: 'date', required: false } }, indexes: { common: { enterpriseCode: { enabled: true, name: 'enterpriseCode' }, catalogCode: { enabled: true, name: 'catalogCode' }, manifestCode: { enabled: true, name: 'manifestCode' } }, individual: { state: { enabled: true, name: 'state' } } } }
} };
