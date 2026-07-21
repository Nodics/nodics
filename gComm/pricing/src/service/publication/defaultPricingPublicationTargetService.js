/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const crypto = require('crypto');
/** @module pricing/service/publication/DefaultPricingPublicationTargetService @description Idempotently imports immutable Pricing releases and atomically activates Online pointers. @layer service @owner pricing */
module.exports = {
    /** Executes the init Pricing contract. */
    init: function () { return Promise.resolve(true); },
    /** Executes the postInit Pricing contract. */
    postInit: function () { return Promise.resolve(true); },
    /** Executes the items Pricing contract. */
    items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Removes source-database metadata before a transported record is persisted in the target database. */
    targetModel: function (source) { let model = Object.assign({}, source); ['_id', 'versionId', 'created', 'updated', 'createdBy', 'updatedBy', 'ownerId', 'ownerType'].forEach(property => delete model[property]); return model; },
    /** Binds the integrity-checked publication enterprise to target-local Pricing interceptors. */
    bindEnterprise: function (request, enterpriseCode) { if (!enterpriseCode) throw new CLASSES.NodicsError('ERR_PRICE_00001', 'Pricing publication enterprise context is required'); request.authData = Object.assign({}, request.authData, { enterprise: { code: enterpriseCode } }); return request; },
    /** Executes the config Pricing contract. */
    config: function () { return (CONFIG.get('pricing') || {}).publication || {}; },
    /** Executes the assertOnline Pricing contract. */
    assertOnline: function () { if (this.config().runtimeRole !== 'ONLINE' || CONFIG.get('publishEnabled') === true) throw new CLASSES.NodicsError('ERR_PRICE_00060', 'Pricing target requires a non-versioned Online runtime'); },
    /** Executes the affected Pricing contract. */
    affected: function (response) { let value = response && response.result !== undefined ? response.result : response; return Number(value && (value.modifiedCount || value.nModified || value.n) || 0); },
    /** Executes the asynchronous pointer Pricing contract. */
    pointer: async function (scope, request) { return this.items(await SERVICE.DefaultPriceOnlinePointerService.get({ tenant: request.tenant, authData: request.authData, query: { enterpriseCode: scope.enterpriseCode, priceListCode: scope.priceListCode }, searchOptions: { limit: 1 } }))[0]; },
    /** Executes the asynchronous manifest Pricing contract. */
    manifest: async function (code, request) { return this.items(await SERVICE.DefaultPricePublicationManifestService.get({ tenant: request.tenant, authData: request.authData, query: { code: code }, searchOptions: { limit: 1 } }))[0]; },
    /** Executes the asynchronous importManifest Pricing contract. */
    importManifest: async function (manifest, request) { SERVICE.DefaultPricingPublicationManifestService.verify(manifest); let existing = await this.manifest(manifest.code, request); if (existing) { if (existing.contentHash !== manifest.contentHash) throw new CLASSES.NodicsError('ERR_PRICE_00057', 'Pricing manifest identity conflict'); return existing; } let targetManifest = Object.assign(this.targetModel(manifest), { active: true }); let response = await SERVICE.DefaultPricePublicationManifestService.save({ tenant: request.tenant, authData: request.authData, model: targetManifest }); return this.items(response)[0] || response.result || targetManifest; },
    /** Executes the asynchronous importRecords Pricing contract. */
    importRecords: async function (manifest, request) { for (let record of manifest.snapshot.records || []) { let service = SERVICE.DefaultPricingPublicationManifestService.serviceFor(record.schema), model = this.targetModel(record.model); let existing = this.items(await service.get({ tenant: request.tenant, authData: request.authData, query: { code: model.code }, searchOptions: { limit: 1 } }))[0]; if (existing) await service.update({ tenant: request.tenant, authData: request.authData, query: { code: model.code }, model: model }); else await service.save({ tenant: request.tenant, authData: request.authData, model: model }); } return true; },
    /** Executes the asynchronous activate Pricing contract. */
    activate: async function (manifest, request) { let scope = manifest.snapshot, current = await this.pointer(scope, request); if (current && current.manifestCode === manifest.code) return { version: manifest.code, previousOnlineVersion: current.previousManifestCode }; let patch = { manifestCode: manifest.code, previousManifestCode: current && current.manifestCode, revision: Number(current && current.revision || 0) + 1, correlationId: request.correlationId || request.requestId }; if (current) { let response = await SERVICE.DefaultPriceOnlinePointerService.update({ tenant: request.tenant, authData: request.authData, query: { code: current.code, revision: Number(current.revision || 0) }, model: patch }); if (this.affected(response) !== 1) throw new CLASSES.NodicsError('ERR_PRICE_00061', 'Pricing Online pointer revision conflict'); } else { let code = crypto.createHash('sha256').update(scope.enterpriseCode + '|' + scope.priceListCode).digest('hex'); await SERVICE.DefaultPriceOnlinePointerService.save({ tenant: request.tenant, authData: request.authData, model: Object.assign({ code: code, active: true, enterpriseCode: scope.enterpriseCode, priceListCode: scope.priceListCode }, patch) }); } return { version: manifest.code, previousOnlineVersion: current && current.manifestCode }; },
    /** Executes the asynchronous receipt Pricing contract. */
    receipt: async function (operation, manifest, result, request) { let code = operation + '_' + manifest.code, existing = this.items(await SERVICE.DefaultPricePublicationReceiptService.get({ tenant: request.tenant, authData: request.authData, query: { code: code }, searchOptions: { limit: 1 } }))[0]; if (existing) return existing; let model = { code: code, active: true, manifestCode: manifest.code, operation: operation, status: 'ONLINE', targetVersion: result.version, previousOnlineVersion: result.previousOnlineVersion, correlationId: request.correlationId || request.requestId }; let response = await SERVICE.DefaultPricePublicationReceiptService.save({ tenant: request.tenant, authData: request.authData, model: model }); return this.items(response)[0] || model; },
    /** Executes the asynchronous deploy Pricing contract. */
    deploy: async function (request) { this.assertOnline(); let input = request.body || request, manifest = input.manifest, target = this.config().target || {}; if (!manifest || Buffer.byteLength(JSON.stringify(manifest), 'utf8') > Number(target.maxManifestBytes || 5242880)) throw new CLASSES.NodicsError('ERR_PRICE_00062', 'Pricing manifest is missing or exceeds target bounds'); if (![].concat(target.supportedContractVersions || [1]).includes(manifest.snapshot && manifest.snapshot.contractVersion)) throw new CLASSES.NodicsError('ERR_PRICE_00063', 'Pricing publication contract is unsupported'); SERVICE.DefaultPricingPublicationManifestService.verify(manifest); this.bindEnterprise(request, manifest.snapshot.enterpriseCode); manifest = await this.importManifest(manifest, request); await this.importRecords(manifest, request); let result = await this.activate(manifest, request); await this.receipt('DEPLOY', manifest, result, request); await SERVICE.DefaultPriceResolutionCacheService.invalidate(request); return result; },
    /** Executes the asynchronous getStatus Pricing contract. */
    getStatus: async function (request) { this.assertOnline(); let input = request.body || request, scope = input.scope || {}; this.bindEnterprise(request, scope.enterpriseCode); let pointer = await this.pointer(scope, request); return pointer && { version: pointer.manifestCode, previousOnlineVersion: pointer.previousManifestCode }; },
    /** Executes the asynchronous rollback Pricing contract. */
    rollback: async function (request) { this.assertOnline(); let input = request.body || request; this.bindEnterprise(request, input.enterpriseCode); let manifest = await this.manifest(input.manifestCode, request); if (!manifest) throw new CLASSES.NodicsError('ERR_PRICE_00064', 'Rollback manifest is unavailable Online'); await this.importRecords(manifest, request); let result = await this.activate(manifest, request); await this.receipt('ROLLBACK', manifest, result, request); await SERVICE.DefaultPriceResolutionCacheService.invalidate(request); return result; }
};
