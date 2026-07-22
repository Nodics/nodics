/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module product/test/ProductPublicationContract @description Proves exact-version Product graph freezing, manifest integrity, Staged/Online separation, internal-token transport, Workflow delegation, and target idempotency boundaries. @layer test @owner product */
const assert = require('assert'), configuration = require('../config/properties'), stagedSchemas = require('../../../startio/envs/startioLocal/startioLocalCmsServer/src/schemas/schemas').product, onlineSchemas = require('../../../startio/envs/startioLocal/startioLocalCmsOnlineServer/src/schemas/schemas').product;
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
let publishEnabled = true; global.CLASSES = { NodicsError }; global.CONFIG = { get: key => key === 'publishEnabled' ? publishEnabled : configuration[key] }; global.SERVICE = {};
let root = { code: 'entA::item::retail::PRODUCT::phone', enterpriseCode: 'entA', catalogCode: 'retail', itemType: 'PRODUCT', itemCode: 'phone', status: 'ACTIVE', active: true, versionId: 3 }, records = { productItem: [root] };
const matches = (item, query) => Object.keys(query || {}).every(key => item[key] === query[key]);
const generated = list => ({ get: async request => ({ result: list.filter(item => matches(item, request.query)) }) });
SERVICE.DefaultProductItemService = generated(records.productItem);
const adapter = require('../src/service/publication/defaultProductPublicationAdapterService'); SERVICE.DefaultProductPublicationAdapterService = adapter;
Object.entries(adapter.descriptors()).forEach(entry => { if (!SERVICE[entry[1]]) SERVICE[entry[1]] = generated([]); });
const manifestService = require('../src/service/publication/defaultProductPublicationManifestService'); SERVICE.DefaultProductPublicationManifestService = manifestService;
let manifests = []; SERVICE.DefaultProductReleaseManifestService = { get: async request => ({ result: manifests.filter(item => matches(item, request.query)) }), save: async request => { manifests.push(request.model); return { result: [request.model] }; } };
(async () => {
    Object.keys(stagedSchemas).forEach(name => assert.strictEqual(stagedSchemas[name].isVersionedEnabled, true));
    Object.keys(onlineSchemas).forEach(name => assert.strictEqual(onlineSchemas[name].isVersionedEnabled, false));
    let publication = { code: 'release-phone', rootCode: root.code, rootType: 'PRODUCT_ITEM', sourceVersion: '3' }, request = { tenant: 't1', authData: { enterprise: { code: 'entA' } } };
    let exact = await adapter.getVersion(publication, request); assert.strictEqual(exact.versionId, 3);
    publication.dependencies = await adapter.resolveDependencies(publication, exact, request); assert(publication.dependencies.some(item => item.code === root.code && item.version === '3'));
    records.productItem.push({ code: 'entA::item::retail::SKU::extra', enterpriseCode: 'entA', catalogCode: 'retail', itemType: 'SKU', itemCode: 'extra', status: 'ACTIVE', active: true, versionId: 1 }); configuration.product.publication.maxDependencies = 1;
    await assert.rejects(adapter.resolveDependencies(publication, exact, request), error => error.code === 'ERR_PRODUCT_00041'); records.productItem.pop(); configuration.product.publication.maxDependencies = 20000;
    let manifest = await manifestService.persist(publication, request); assert.strictEqual(manifest.snapshot.catalogCode, 'retail'); assert(manifestService.verify(manifest));
    let tampered = Object.assign({}, manifest, { snapshot: Object.assign({}, manifest.snapshot, { catalogCode: 'other' }) }); assert.throws(() => manifestService.verify(tampered), error => error.code === 'ERR_PRODUCT_00048');
    await assert.rejects(manifestService.load({ schema: 'productItem', code: 'missing', version: '99' }, request), error => error.code === 'ERR_PRODUCT_00046');
    configuration.product.publication.runtimeRole = 'STAGED'; configuration.product.publication.targetTransportProvider = 'Transport'; SERVICE.Transport = { deploy: async () => ({ version: manifest.code }), getStatus: async () => null, rollback: async () => ({ version: manifest.code }) };
    let provider = require('../src/service/publication/defaultProductPublicationVersionProviderService'); assert.strictEqual((await provider.activate(publication, request)).version, manifest.code); SERVICE.Transport.deploy = async () => { throw new NodicsError('TARGET_DOWN'); }; await assert.rejects(provider.activate(publication, request), error => error.code === 'TARGET_DOWN'); SERVICE.Transport.deploy = async () => ({ version: manifest.code });
    global.NODICS = { getInternalAuthToken: () => 'service-token' }; let sent; SERVICE.DefaultModuleService = { buildRequest: input => input, fetch: async descriptor => { sent = descriptor; return { data: { ok: true } }; } }; configuration.product.publication.target = { moduleName: 'product', connectionName: 'productOnline', connectionType: 'server' }; let transport = require('../src/service/publication/defaultProductPublicationModuleTransportService'); await transport.deploy({ manifest }, request); assert.strictEqual(sent.header.Authorization, 'Bearer service-token'); assert.strictEqual(sent.connectionName, 'productOnline');
    let published; SERVICE.DefaultPublicationLifecycleService = { publishApproved: async context => { published = context; return { code: context.publication.code, targetVersion: manifest.code, state: 'ONLINE' }; } }; let workflow = require('../src/service/publication/defaultProductPublicationWorkflowService'), carrier = { code: 'wf-1', sourceDetail: { approvalMode: 'MANUAL', publication: { code: 'pub-1', domain: 'product', rootType: 'PRODUCT_ITEM', rootCode: root.code, sourceVersion: '3' } }, items: [{ schemaName: 'productItem', code: root.code, versionId: 3 }] }; let result = await workflow.publish({ tenant: 't1', authData: {}, workflowCarrier: carrier }); assert.strictEqual(result.feedback.state, 'ONLINE'); assert.strictEqual(published.publication.domain, 'product');
    publishEnabled = false; configuration.product.publication.runtimeRole = 'ONLINE'; let onlineItems = [], onlineManifests = [], pointers = [], receipts = [];
    const mutable = list => ({ get: async request => ({ result: list.filter(item => matches(item, request.query)) }), save: async request => { list.push(Object.assign({}, request.model)); return { result: [request.model] }; }, update: async request => { let index = list.findIndex(item => matches(item, request.query)); if (index < 0) return { result: { modifiedCount: 0 } }; list[index] = Object.assign({}, list[index], request.model); return { result: { modifiedCount: 1 } }; } });
    SERVICE.DefaultProductItemService = mutable(onlineItems); Object.entries(adapter.descriptors()).forEach(entry => { if (entry[0] !== 'productItem') SERVICE[entry[1]] = mutable([]); }); SERVICE.DefaultProductReleaseManifestService = mutable(onlineManifests); SERVICE.DefaultProductOnlinePointerService = mutable(pointers); SERVICE.DefaultProductPublicationReceiptService = mutable(receipts);
    let target = require('../src/service/publication/defaultProductPublicationTargetService'), deployed = await target.deploy({ tenant: 't1', authData: { tokenType: 'service' }, body: { manifest } }); assert.strictEqual(deployed.version, manifest.code); assert.strictEqual(onlineItems.length, 1); assert.strictEqual(pointers.length, 1); assert.strictEqual(receipts.length, 1);
    let repeated = await target.deploy({ tenant: 't1', authData: { tokenType: 'service' }, body: { manifest } }); assert.strictEqual(repeated.version, manifest.code); assert.strictEqual(receipts.length, 1);
    await assert.rejects(target.deploy({ tenant: 't1', authData: {}, body: { manifest: tampered } }), error => error.code === 'ERR_PRODUCT_00048');
    let unsupported = Object.assign({}, manifest, { code: 'manifest-v2', snapshot: Object.assign({}, manifest.snapshot, { contractVersion: 2 }) }); unsupported.contentHash = manifestService.hash(unsupported.dependencies, unsupported.snapshot);
    await assert.rejects(target.deploy({ tenant: 't1', authData: { tokenType: 'service' }, body: { manifest: unsupported } }), error => error.code === 'ERR_PRODUCT_00053');
    configuration.product.publication.target.maxManifestBytes = 1; await assert.rejects(target.deploy({ tenant: 't1', authData: { tokenType: 'service' }, body: { manifest } }), error => error.code === 'ERR_PRODUCT_00052'); configuration.product.publication.target.maxManifestBytes = 20971520;
    let second = Object.assign({}, manifest, { code: 'release-phone-4', sourceVersion: 4, snapshot: Object.assign({}, manifest.snapshot, { records: manifest.snapshot.records.map(record => ({ schema: record.schema, model: Object.assign({}, record.model, { versionId: 4 }) })) }) }); second.dependencies = manifest.dependencies.map(identity => Object.assign({}, identity, { version: '4' })); second.contentHash = manifestService.hash(second.dependencies, second.snapshot);
    let pointerService = SERVICE.DefaultProductOnlinePointerService, conflictOnce = true; SERVICE.DefaultProductOnlinePointerService = Object.assign({}, pointerService, { update: async updateRequest => { if (conflictOnce) { conflictOnce = false; return { result: { modifiedCount: 0 } }; } return pointerService.update(updateRequest); } });
    await assert.rejects(target.deploy({ tenant: 't1', authData: { tokenType: 'service' }, body: { manifest: second } }), error => error.code === 'ERR_PRODUCT_00051'); assert.strictEqual(pointers[0].manifestCode, manifest.code);
    let secondDeployment = await target.deploy({ tenant: 't1', authData: { tokenType: 'service' }, body: { manifest: second } }); assert.strictEqual(secondDeployment.version, second.code); assert.strictEqual(pointers[0].manifestCode, second.code);
    let rollback = await target.rollback({ tenant: 't1', authData: { tokenType: 'service' }, body: { enterpriseCode: 'entA', manifestCode: manifest.code } }); assert.strictEqual(rollback.version, manifest.code); assert.strictEqual(pointers[0].manifestCode, manifest.code); assert(receipts.some(receipt => receipt.operation === 'ROLLBACK'));
    console.log('Product P2-P4 Workflow, publication, and release-readiness contract validated');
})().catch(error => { console.error(error); process.exit(1); });
