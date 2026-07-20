/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** Validates exact-version CMS dependency, immutable manifest, Online pointer, delivery, and rollback contracts. */
const assert = require('assert');
const schemas = require('../src/schemas/schemas').cms;
const properties = require('../config/properties');
const routes = require('../src/router/routers').cms;

class NodicsError extends Error {
    constructor(code, message) { super(message || code); this.code = code; }
}
global.CLASSES = { NodicsError: NodicsError };
global._ = require('lodash');
global.CONFIG = { get: key => {
    if (key === 'cms') return properties.cms;
} };

['cmsPageRoute', 'cmsPage', 'cmsComponentDetail', 'cmsComponent', 'cmsPageTemplate', 'cmsSlotDefinition'].forEach(name => {
    assert.strictEqual(schemas[name].isVersionedEnabled, false, name + ' must remain disabled until an active versioned deployment layer opts in');
});
assert.strictEqual(schemas.cmsPublicationManifest.isVersionedEnabled, false);
assert.strictEqual(schemas.cmsOnlinePublicationPointer.isVersionedEnabled, false);
assert.strictEqual(properties.publish.providers.domainAdapters.cms, 'DefaultCmsPublicationAdapterService');
assert.strictEqual(properties.publish.providers.versionProviders.cms, 'DefaultCmsPublicationVersionProviderService');
['deployPublication', 'getPublicationStatus', 'rollbackPublication'].forEach(operation => {
    assert.strictEqual(routes.cmsPublicationTarget[operation].secured, true);
    assert.deepStrictEqual(routes.cmsPublicationTarget[operation].authTokenTypes, ['service']);
    assert.strictEqual(routes.cmsPublicationTarget[operation].permissionConfig, 'authSecurity.internalToken.routePermission');
});

const data = {
    routes: [{ code: 'home-route', versionId: 2, active: true, site: 'site-a', path: '/home', locale: 'en', channel: 'web',
        accessMode: 'PUBLIC', routeType: 'PAGE', page: 'home' }],
    pages: [{ code: 'home', versionId: 3, active: true, name: 'Home', typeCode: 'homePage', renderer: 'page.home', template: 'main' }],
    details: [{ code: 'home-hero', versionId: 1, active: true, source: 'home', target: 'hero', slot: 'main', index: 0 }],
    components: [{ code: 'hero', versionId: 4, active: true, typeCode: 'heroType', renderer: 'component.hero', properties: { title: 'Hello' } }],
    templates: [{ code: 'main', versionId: 1, active: true, name: 'Main', renderer: 'template.main' }],
    slots: [{ code: 'main-main', versionId: 1, active: true, template: 'main', name: 'main' }],
    manifests: [], pointers: [], receipts: []
};
const matches = (model, query) => Object.keys(query || {}).every(key => {
    let expected = query[key];
    if (expected && expected.$in) return expected.$in.includes(model[key]);
    return model[key] === expected;
});
const generated = list => ({
    get: async request => ({ result: list.filter(item => matches(item, request.query)) }),
    save: async request => { list.push(Object.assign({}, request.model)); return { result: [request.model] }; },
    update: async request => {
        let item = list.find(model => matches(model, request.query));
        if (!item) return { result: { modifiedCount: 0 } };
        Object.assign(item, request.model); return { result: { modifiedCount: 1 } };
    }
});
global.SERVICE = {
    DefaultCmsPageRouteService: generated(data.routes),
    DefaultCmsPageService: generated(data.pages),
    DefaultCmsComponentDetailService: generated(data.details),
    DefaultCmsComponentService: generated(data.components),
    DefaultCmsPageTemplateService: generated(data.templates),
    DefaultCmsSlotDefinitionService: generated(data.slots),
    DefaultCmsPublicationManifestService: generated(data.manifests),
    DefaultCmsOnlinePublicationPointerService: generated(data.pointers),
    DefaultCmsPublicationDeploymentReceiptService: generated(data.receipts),
    DefaultCmsContractValidationService: require('../src/service/validation/defaultCmsContractValidationService'),
    DefaultCmsDeliveryCacheInvalidationService: { invalidate: async () => true }
};
const adapter = require('../src/service/publication/defaultCmsPublicationAdapterService');
const manifests = require('../src/service/publication/defaultCmsPublicationManifestOrchestrationService');
const provider = require('../src/service/publication/defaultCmsPublicationVersionProviderService');
const target = require('../src/service/publication/defaultCmsPublicationTargetService');
SERVICE.DefaultCmsPublicationAdapterService = adapter;
SERVICE.DefaultCmsPublicationManifestOrchestrationService = manifests;
const onTarget = async operation => {
    let priorRole = properties.cms.publication.runtimeRole;
    properties.cms.publication.runtimeRole = 'ONLINE';
    try { return await operation(); } finally { properties.cms.publication.runtimeRole = priorRole; }
};
SERVICE.TestCmsTargetTransport = {
    deploy: (payload, targetRequest) => onTarget(() => target.deploy(Object.assign({}, targetRequest, { cmsPublicationTarget: payload }))),
    getStatus: (payload, targetRequest) => onTarget(() => target.getStatus(Object.assign({}, targetRequest, { cmsPublicationTarget: payload }))),
    rollback: (payload, targetRequest) => onTarget(() => target.rollback(Object.assign({}, targetRequest, { cmsPublicationTarget: payload })))
};
properties.cms.publication.targetTransportProvider = 'TestCmsTargetTransport';
properties.cms.publication.runtimeRole = 'STAGED';

const publication = { code: 'publish-home', domain: 'cms', rootType: 'pageRoute', rootCode: 'home-route', sourceVersion: '2' };
const request = { tenant: 'tenant-a', authData: { principalId: 'publisher-a' }, correlationId: 'correlation-a' };

(async () => {
    let root = await adapter.getVersion(publication, request);
    let dependencies = await adapter.resolveDependencies(publication, root, request);
    assert(dependencies.some(item => item.schema === 'cmsPage' && item.code === 'home' && item.version === '3'));
    assert(dependencies.some(item => item.schema === 'cmsComponent' && item.code === 'hero' && item.version === '4'));
    assert.strictEqual((await adapter.validate(publication, root, request, dependencies)).valid, true);
    let missingDependency = dependencies.map(item => item.schema === 'cmsComponent' ? Object.assign({}, item, { version: '99' }) : item);
    assert.strictEqual((await adapter.validate(publication, root, request, missingDependency)).valid, false,
        'validation must fail closed when a frozen dependency version disappears');
    let originalMax = properties.cms.publication.maxDependencies;
    properties.cms.publication.maxDependencies = 1;
    await assert.rejects(adapter.resolveDependencies(publication, root, request),
        error => error.code === 'CMS_PUBLICATION_DEPENDENCY_EXCEEDED');
    properties.cms.publication.maxDependencies = originalMax;
    await assert.rejects(adapter.getVersion(Object.assign({}, publication, { rootType: 'unknown' }), request),
        error => error.code === 'CMS_PUBLICATION_ROOT_UNSUPPORTED');

    publication.dependencies = dependencies;
    let manifest = await manifests.persist(publication, request);
    assert.strictEqual(manifest.snapshot.page.components[0].code, 'hero');
    assert.strictEqual(manifest.snapshot.page.components[0].properties.title, 'Hello');
    assert.strictEqual((await manifests.persist(publication, request)).code, manifest.code, 'manifest persistence must be idempotent');

    let activated = await provider.activate(publication, request);
    assert.strictEqual(activated.version, manifest.code);
    assert.strictEqual(data.pointers.length, 1);
    assert.strictEqual(data.receipts.length, 1);
    assert.strictEqual((await provider.getOnlineVersion(publication, request)).version, manifest.code);
    assert.strictEqual((await provider.activate(publication, request)).version, manifest.code, 'activation replay must be idempotent');

    properties.cms.publication.enabled = true;
    const delivery = require('../src/service/delivery/defaultCmsDeliveryService');
    let delivered = await delivery.resolvePage({ tenant: 'tenant-a', authData: {}, router: { publicAccess: true },
        delivery: { site: 'site-a', path: '/home', locale: 'en', channel: 'web' } });
    assert.strictEqual(delivered.result.page.components[0].code, 'hero');
    await assert.rejects(delivery.resolvePage({ tenant: 'tenant-a', authData: {}, router: { publicAccess: true },
        delivery: { site: 'site-a', path: '/missing', locale: 'en', channel: 'web' } }),
    error => error.code === 'CMS_PUBLICATION_POINTER_NOT_FOUND');
    properties.cms.publication.enabled = false;

    let previous = Object.assign({}, manifest, { code: 'publish-home_1', sourceVersion: '1', contentHash: 'previous' });
    data.manifests.push(previous);
    let rolledBack = await provider.rollback(publication, previous.code, request);
    assert.strictEqual(rolledBack.version, previous.code);
    assert.strictEqual(data.pointers[0].manifestCode, previous.code);
    assert(data.receipts.some(receipt => receipt.operation === 'ROLLBACK' && receipt.manifestCode === previous.code));

    let tampered = JSON.parse(JSON.stringify(manifest));
    tampered.snapshot.page.name = 'Tampered page';
    await assert.rejects(onTarget(() => target.deploy(Object.assign({}, request, { cmsPublicationTarget: { manifest: tampered } }))),
        error => error.code === 'CMS_PUBLICATION_MANIFEST_INTEGRITY');

    let originalMaxManifestBytes = properties.cms.publication.target.maxManifestBytes;
    properties.cms.publication.target.maxManifestBytes = 1;
    await assert.rejects(onTarget(() => target.deploy(Object.assign({}, request, { cmsPublicationTarget: { manifest: manifest } }))),
        error => error.code === 'CMS_PUBLICATION_MANIFEST_BOUNDARY');
    properties.cms.publication.target.maxManifestBytes = originalMaxManifestBytes;

    let unsupported = JSON.parse(JSON.stringify(manifest));
    unsupported.snapshot.contractVersion = 99;
    await assert.rejects(onTarget(() => target.deploy(Object.assign({}, request, { cmsPublicationTarget: { manifest: unsupported } }))),
        error => error.code === 'CMS_PUBLICATION_CONTRACT_UNSUPPORTED');

    await assert.rejects(onTarget(() => target.rollback(Object.assign({}, request,
        { cmsPublicationTarget: { manifestCode: 'missing-manifest' } }))),
    error => error.code === 'CMS_PUBLICATION_MANIFEST_MISSING');

    let originalUpdate = SERVICE.DefaultCmsOnlinePublicationPointerService.update;
    SERVICE.DefaultCmsOnlinePublicationPointerService.update = async () => ({ result: { modifiedCount: 0 } });
    await assert.rejects(manifests.activate(manifest, request), error => error.code === 'CMS_PUBLICATION_POINTER_CONFLICT');
    SERVICE.DefaultCmsOnlinePublicationPointerService.update = originalUpdate;

    let originalPointerGet = SERVICE.DefaultCmsOnlinePublicationPointerService.get;
    let originalPointerSave = SERVICE.DefaultCmsOnlinePublicationPointerService.save;
    let racePointer;
    SERVICE.DefaultCmsOnlinePublicationPointerService.get = async () => ({ result: racePointer ? [racePointer] : [] });
    SERVICE.DefaultCmsOnlinePublicationPointerService.save = async saveRequest => {
        if (racePointer) throw new NodicsError('DUPLICATE_POINTER', 'Duplicate pointer');
        racePointer = Object.assign({}, saveRequest.model);
        return { result: [racePointer] };
    };
    let raceManifest = Object.assign({}, manifest, { code: 'publish-home-race',
        snapshot: Object.assign({}, manifest.snapshot, { path: '/race' }) });
    let concurrentActivation = await Promise.all([manifests.activate(raceManifest, request), manifests.activate(raceManifest, request)]);
    assert(concurrentActivation.every(result => result.version === raceManifest.code),
        'concurrent identical first activation must converge on one Online pointer');
    SERVICE.DefaultCmsOnlinePublicationPointerService.get = originalPointerGet;
    SERVICE.DefaultCmsOnlinePublicationPointerService.save = originalPointerSave;

    let originalReceiptGet = SERVICE.DefaultCmsPublicationDeploymentReceiptService.get;
    let originalReceiptSave = SERVICE.DefaultCmsPublicationDeploymentReceiptService.save;
    let raceReceipt;
    SERVICE.DefaultCmsPublicationDeploymentReceiptService.get = async () => ({ result: raceReceipt ? [raceReceipt] : [] });
    SERVICE.DefaultCmsPublicationDeploymentReceiptService.save = async saveRequest => {
        if (raceReceipt) throw new NodicsError('DUPLICATE_RECEIPT', 'Duplicate receipt');
        raceReceipt = Object.assign({}, saveRequest.model);
        return { result: [raceReceipt] };
    };
    let concurrentReceipt = await Promise.all([
        target.recordReceipt('DEPLOY', raceManifest, { version: raceManifest.code }, request),
        target.recordReceipt('DEPLOY', raceManifest, { version: raceManifest.code }, request)
    ]);
    assert(concurrentReceipt.every(receipt => receipt.code === 'DEPLOY_' + raceManifest.code),
        'concurrent identical receipt writes must converge on one deployment receipt');
    SERVICE.DefaultCmsPublicationDeploymentReceiptService.get = originalReceiptGet;
    SERVICE.DefaultCmsPublicationDeploymentReceiptService.save = originalReceiptSave;

    const transport = require('../src/service/publication/defaultCmsPublicationModuleTransportService');
    properties.cms.publication.runtimeRole = 'STAGED';
    properties.cms.publication.target = Object.assign({}, properties.cms.publication.target,
        { moduleName: 'cms', connectionName: 'cmsOnline' });
    let transportDescriptor;
    SERVICE.DefaultModuleService = {
        buildRequest: options => { transportDescriptor = options; return options; },
        fetch: async () => ({ result: { version: 'target-v1' } })
    };
    global.NODICS = { getInternalAuthToken: () => undefined };
    assert.throws(() => transport.deploy({ manifest: manifest }, request),
        error => error.code === 'CMS_PUBLICATION_INTERNAL_AUTH_UNAVAILABLE');
    NODICS.getInternalAuthToken = tenant => tenant === 'tenant-a' ? 'service-token' : undefined;
    assert.strictEqual((await transport.deploy({ manifest: manifest }, request)).version, 'target-v1');
    assert.strictEqual(transportDescriptor.connectionName, 'cmsOnline');
    assert.strictEqual(transportDescriptor.requestBody.tenant, 'tenant-a');
    assert.strictEqual(transportDescriptor.requestBody.correlationId, 'correlation-a');
    assert.strictEqual(transportDescriptor.header.Authorization, 'Bearer service-token');

    properties.cms.publication.runtimeRole = 'STAGED';
    await assert.rejects(target.deploy({ tenant: 'tenant-a', cmsPublicationTarget: { manifest: manifest } }),
        error => error.code === 'CMS_PUBLICATION_TARGET_ROLE_INVALID');
    properties.cms.publication.runtimeRole = 'ONLINE';
    global.CONFIG = { get: key => key === 'cms' ? properties.cms : key === 'publishEnabled' ? true : undefined };
    await assert.rejects(target.deploy({ tenant: 'tenant-a', cmsPublicationTarget: { manifest: manifest } }),
        error => error.code === 'CMS_PUBLICATION_TARGET_VERSIONING_INVALID');

    console.log('CMS publication manifest contract validated');
})().catch(error => { console.error(error); process.exit(1); });
