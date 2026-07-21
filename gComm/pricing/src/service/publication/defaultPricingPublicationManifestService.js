/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const crypto = require('crypto');
/** @module pricing/service/publication/DefaultPricingPublicationManifestService @description Builds and verifies immutable exact-version Pricing manifests. @layer service @owner pricing */
module.exports = {
    /** Executes the init Pricing contract. */
    init: function () { return Promise.resolve(true); },
    /** Executes the postInit Pricing contract. */
    postInit: function () { return Promise.resolve(true); },
    /** Executes the items Pricing contract. */
    items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Executes the serviceFor Pricing contract. */
    serviceFor: function (schema) { let names = { priceList: 'DefaultPriceListService', priceListAssignment: 'DefaultPriceListAssignmentService', priceGroup: 'DefaultPriceGroupService', priceGroupMember: 'DefaultPriceGroupMemberService', price: 'DefaultPriceService' }; if (!names[schema] || !SERVICE[names[schema]]) throw new CLASSES.NodicsError('ERR_PRICE_00055', 'Pricing publication schema service is unavailable'); return SERVICE[names[schema]]; },
    /** Executes the asynchronous load Pricing contract. */
    load: async function (identity, request) { let model = this.items(await this.serviceFor(identity.schema).get({ tenant: request.tenant, authData: request.authData, query: { code: identity.code, versionId: Number(identity.version), active: true }, searchOptions: { limit: 1 } }))[0]; if (!model) throw new CLASSES.NodicsError('ERR_PRICE_00056', 'Frozen Pricing dependency is unavailable'); return model; },
    /** Executes the asynchronous build Pricing contract. */
    build: async function (publication, request) { let records = []; for (let identity of publication.dependencies || []) records.push({ schema: identity.schema, model: await this.load(identity, request) }); return { contractVersion: 1, enterpriseCode: records[0] && records[0].model.enterpriseCode, priceListCode: records[0] && records[0].model.priceListCode, records: records }; },
    /** Executes the hash Pricing contract. */
    hash: function (dependencies, snapshot) { return crypto.createHash('sha256').update(JSON.stringify({ dependencies: dependencies, snapshot: snapshot })).digest('hex'); },
    /** Executes the asynchronous persist Pricing contract. */
    persist: async function (publication, request) { let snapshot = await this.build(publication, request), contentHash = this.hash(publication.dependencies, snapshot), code = publication.code + '_' + publication.sourceVersion; let existing = this.items(await SERVICE.DefaultPricePublicationManifestService.get({ tenant: request.tenant, authData: request.authData, query: { code: code }, searchOptions: { limit: 1 } }))[0]; if (existing) { if (existing.contentHash !== contentHash) throw new CLASSES.NodicsError('ERR_PRICE_00057', 'Pricing manifest identity conflict'); return existing; } let model = { code: code, active: true, publicationCode: publication.code, rootCode: publication.rootCode, sourceVersion: Number(publication.sourceVersion), dependencies: publication.dependencies, snapshot: snapshot, contentHash: contentHash, correlationId: request.correlationId || request.requestId }; let response = await SERVICE.DefaultPricePublicationManifestService.save({ tenant: request.tenant, authData: request.authData, model: model }); return this.items(response)[0] || response.result || model; },
    /** Executes the verify Pricing contract. */
    verify: function (manifest) { if (!manifest || manifest.contentHash !== this.hash(manifest.dependencies, manifest.snapshot) || !manifest.snapshot || manifest.snapshot.contractVersion !== 1) throw new CLASSES.NodicsError('ERR_PRICE_00058', 'Pricing manifest integrity validation failed'); return true; }
};
