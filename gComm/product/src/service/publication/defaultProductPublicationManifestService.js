/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const crypto = require('crypto');
/** @module product/service/publication/DefaultProductPublicationManifestService @description Builds and verifies immutable exact-version Product manifests. @layer service @owner product */
module.exports = {
    /** Initializes manifest handling. */ init: function () { return Promise.resolve(true); },
    /** Completes manifest initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Extracts generated-service items. */ items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Resolves an allow-listed Product schema service. */ serviceFor: function (schema) { let name = SERVICE.DefaultProductPublicationAdapterService.descriptors()[schema]; if (!name || !SERVICE[name]) throw new CLASSES.NodicsError('ERR_PRODUCT_00045', 'Product publication schema service is unavailable'); return SERVICE[name]; },
    /** Loads one exact frozen Product record. */ load: async function (identity, request) { let model = this.items(await this.serviceFor(identity.schema).get({ tenant: request.tenant, authData: request.authData, query: { code: identity.code, versionId: Number(identity.version), active: true }, searchOptions: { limit: 1 } }))[0]; if (!model) throw new CLASSES.NodicsError('ERR_PRODUCT_00046', 'Frozen Product dependency is unavailable'); return model; },
    /** Builds a deterministically ordered Product snapshot. */ build: async function (publication, request) { let records = []; for (let identity of publication.dependencies || []) records.push({ schema: identity.schema, model: await this.load(identity, request) }); let root = records.find(record => record.schema === 'productItem' && record.model.code === publication.rootCode); return { contractVersion: 1, enterpriseCode: root && root.model.enterpriseCode, catalogCode: root && root.model.catalogCode, records: records }; },
    /** Hashes manifest dependencies and snapshot. */ hash: function (dependencies, snapshot) { return crypto.createHash('sha256').update(JSON.stringify({ dependencies: dependencies, snapshot: snapshot })).digest('hex'); },
    /** Persists one immutable manifest idempotently. */ persist: async function (publication, request) { let snapshot = await this.build(publication, request), contentHash = this.hash(publication.dependencies, snapshot), code = publication.code + '_' + publication.sourceVersion, existing = this.items(await SERVICE.DefaultProductReleaseManifestService.get({ tenant: request.tenant, authData: request.authData, query: { code: code }, searchOptions: { limit: 1 } }))[0]; if (existing) { if (existing.contentHash !== contentHash) throw new CLASSES.NodicsError('ERR_PRODUCT_00047', 'Product manifest identity conflict'); return existing; } let model = { code: code, active: true, publicationCode: publication.code, rootCode: publication.rootCode, sourceVersion: Number(publication.sourceVersion), dependencies: publication.dependencies, snapshot: snapshot, contentHash: contentHash, correlationId: request.correlationId || request.requestId }, response = await SERVICE.DefaultProductReleaseManifestService.save({ tenant: request.tenant, authData: request.authData, model: model }); return this.items(response)[0] || response.result || model; },
    /** Verifies manifest integrity and contract version. */ verify: function (manifest) { if (!manifest || manifest.contentHash !== this.hash(manifest.dependencies, manifest.snapshot) || !manifest.snapshot || manifest.snapshot.contractVersion !== 1) throw new CLASSES.NodicsError('ERR_PRODUCT_00048', 'Product manifest integrity validation failed'); return true; }
};
