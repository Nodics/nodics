/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module product/service/projection/DefaultProductSearchProjectionProviderService @description Builds Product-owned search documents and delegates indexing to the existing nSearch indexer authority. @layer service @owner product */
module.exports = {
    /** Initializes the Product search projection provider. */ init: function () { return Promise.resolve(true); },
    /** Completes provider initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Returns layered search-projection policy. */ policy: function () { return (CONFIG.get('product') || {}).searchProjection || {}; },
    /** Groups immutable manifest records by schema. */ grouped: function (manifest) { return (manifest.snapshot.records || []).reduce((result, record) => { if (!result[record.schema]) result[record.schema] = []; result[record.schema].push(record.model); return result; }, {}); },
    /** Builds bounded Product search documents without price or stock truth. */ documents: function (manifest) { let grouped = this.grouped(manifest), maximum = Number(this.policy().maximumDocuments || 20000), documents = (grouped.productItem || []).filter(item => item.status === 'ACTIVE').map(item => { let matches = model => model.itemType === item.itemType && model.itemCode === item.itemCode; return { code: item.code, enterpriseCode: item.enterpriseCode, catalogCode: item.catalogCode, itemType: item.itemType, itemCode: item.itemCode, name: item.name, description: item.description, sellable: item.sellable, stockManaged: item.stockManaged, categoryCodes: (grouped.productCategoryAssignment || []).filter(matches).map(model => model.categoryCode), attributes: (grouped.productAttributeValue || []).filter(matches).map(model => ({ attributeCode: model.attributeCode, localeCode: model.localeCode, stringValue: model.stringValue, booleanValue: model.booleanValue, integerValue: model.integerValue, decimalValue: model.decimalValue, referenceCode: model.referenceCode, unitCode: model.unitCode })), media: (grouped.productMediaReference || []).filter(matches).map(model => ({ mediaType: model.mediaType, role: model.role, localeCode: model.localeCode, uri: model.uri, position: model.position })), releaseVersion: manifest.code }; }); if (documents.length > maximum) throw new CLASSES.NodicsError('ERR_PRODUCT_00066', 'Product search projection exceeds configured bounds'); return documents; },
    /** Indexes Product documents through nSearch, never a direct provider. */ project: function (manifest, request) { let policy = this.policy(); if (policy.enabled === false) return Promise.resolve({ state: 'SKIPPED', count: 0 }); if (!SERVICE.DefaultIndexerService || typeof SERVICE.DefaultIndexerService.prepareIndexer !== 'function') return Promise.reject(new CLASSES.NodicsError('ERR_PRODUCT_00066', 'Configured nSearch indexer is unavailable')); let documents = this.documents(manifest); return SERVICE.DefaultIndexerService.prepareIndexer({ tenant: request.tenant, authData: request.authData, moduleName: 'product', indexerCode: policy.indexerCode, indexName: policy.indexName, models: documents, correlationId: request.correlationId || request.requestId }).then(() => ({ state: 'COMPLETE', count: documents.length })); }
};
