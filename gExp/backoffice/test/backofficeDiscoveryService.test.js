/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/**
 * @module backoffice/test/backofficeDiscoveryService
 * @description Validates bounded OpenAPI normalization, authority filtering, hashing, change classification, and safe snapshot preservation.
 * @layer test
 * @owner backoffice
 */
const assert = require('assert');

let policy = { enabled: true, maxPaths: 10, maxOperations: 10, allowedHosts: ['cms.example'], refreshIntervalMs: 60000 };
global.CONFIG = { get: key => key === 'backofficeRegistry' ? { allowedSchemes: ['https'], discovery: policy } :
    key === 'defaultTenant' ? 'default' : undefined };
global.NODICS = { getInternalAuthToken: tenant => tenant === 'default' ? 'internal-token' : undefined };
let fetchedRequest;
global.SERVICE = { DefaultModuleService: {
    buildExternalRequest: options => Object.assign({ headers: options.header }, options),
    fetch: request => { fetchedRequest = request; return Promise.resolve({ openapi: '3.0.3', paths: {} }); }
} };
const definition = require('../src/service/discovery/defaultBackofficeDiscoveryService');
const service = Object.assign({}, definition, { _snapshots: new Map(), _inflight: new Map(),
    _metrics: { attempts: 0, successes: 0, failures: 0, breakingChanges: 0, lastSuccessAt: null, lastFailureAt: null } });

const registration = { moduleName: 'cms', instanceId: 'runtime-1', clientCallable: true,
    endpoint: 'https://cms.example/nodics/cms', backoffice: { discovery: {
        openApiPath: '/nodics/system/v0/contract/openapi/internal', contractVersion: 1
    } } };
const operation = (id, method, permissions) => ({ operationId: id, 'x-nodics': {
    moduleName: 'cms', schemaName: 'cmsPage', operation: method, permissions: permissions || []
} });
const document = paths => ({ openapi: '3.0.3', paths: paths });

async function run() {
    assert.strictEqual(service.buildContractUrl(registration), 'https://cms.example/nodics/system/v0/contract/openapi/internal');
    assert.throws(() => service.buildContractUrl(Object.assign({}, registration, { endpoint: 'https://evil.example/nodics/cms' })));
    assert.throws(() => service.buildContractUrl(Object.assign({}, registration, { endpoint: 'file:///tmp/contract' })));
    await service.fetchContract(registration);
    assert.strictEqual(fetchedRequest.header.Authorization, 'Bearer internal-token');
    assert.strictEqual(fetchedRequest.followRedirects, false);
    assert.strictEqual(fetchedRequest.maxResponseBytes, 5242880);

    let initial = await service.discover(registration, document({
        '/nodics/cms/v0/page': { get: operation('cms_page_get', 'get'), post: operation('cms_page_post', 'save') },
        '/nodics/profile/v0/user': { get: { operationId: 'profile_user_get', 'x-nodics': { moduleName: 'profile' } } }
    }));
    assert.strictEqual(initial.changeClassification, 'INITIAL');
    assert.strictEqual(initial.operations.length, 2, 'normalization must retain only operations owned by the registered module');
    assert.deepStrictEqual(initial.schemas, ['cmsPage']);
    assert.strictEqual(initial.hash.length, 64);

    let expanded = await service.discover(registration, document({
        '/nodics/cms/v0/page': { get: operation('cms_page_get', 'get'), post: operation('cms_page_post', 'save') },
        '/nodics/cms/v0/site': { get: operation('cms_site_get', 'get') }
    }));
    assert.strictEqual(expanded.changeClassification, 'NON_BREAKING');
    let acceptedHash = expanded.hash;

    let afterPermissionChange = await service.discover(registration, document({
        '/nodics/cms/v0/page': { get: operation('cms_page_get', 'get', ['cms.page.read']), post: operation('cms_page_post', 'save') },
        '/nodics/cms/v0/site': { get: operation('cms_site_get', 'get') }
    }));
    assert.strictEqual(afterPermissionChange.hash, acceptedHash, 'permission changes must remain pending and preserve the safe snapshot');
    assert.strictEqual(afterPermissionChange.latestChangeClassification, 'POTENTIALLY_BREAKING');
    assert(afterPermissionChange.candidateHash && afterPermissionChange.candidateHash !== acceptedHash);

    let afterBreaking = await service.discover(registration, document({
        '/nodics/cms/v0/page': { get: operation('cms_page_get', 'get') }
    }));
    assert.strictEqual(afterBreaking.hash, acceptedHash, 'breaking discovery must preserve the last safe active snapshot');
    assert.strictEqual(afterBreaking.latestChangeClassification, 'BREAKING');
    assert(afterBreaking.candidateHash && afterBreaking.candidateHash !== acceptedHash);

    await assert.rejects(service.discover(registration, { openapi: '2.0', paths: {} }));
    policy.maxOperations = 1;
    await assert.rejects(service.discover(registration, document({ '/nodics/cms/v0/page': {
        get: operation('cms_page_get', 'get'), post: operation('cms_page_post', 'save')
    } })));
    assert.strictEqual(service.getDiagnostics().failures, 2);
    console.log('BackOffice discovery service validated');
}

run().catch(error => { console.error(error); process.exit(1); });
