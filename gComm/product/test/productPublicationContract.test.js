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
    let manifest = await manifestService.persist(publication, request); assert.strictEqual(manifest.snapshot.catalogCode, 'retail'); assert(manifestService.verify(manifest));
    let tampered = Object.assign({}, manifest, { snapshot: Object.assign({}, manifest.snapshot, { catalogCode: 'other' }) }); assert.throws(() => manifestService.verify(tampered), error => error.code === 'ERR_PRODUCT_00048');
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
    console.log('Product P2 Workflow and nPublish publication contract validated');
})().catch(error => { console.error(error); process.exit(1); });
