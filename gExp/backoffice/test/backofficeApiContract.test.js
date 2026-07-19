/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/test/backofficeApiContract
 * @description Validates registration schemas, route OpenAPI contracts, module-owned catalogue metadata, and compatibility boundaries.
 * @layer test
 * @owner backoffice
 */
const assert = require('assert');
const contracts = require('../src/schemas/apiContracts');
const service = require('../src/service/contract/defaultBackofficeContractService');
const routers = require('../src/router/routers').backoffice;

const packages = [
    require('../../../gCore/profile/package.json'),
    require('../../../gContent/cms/package.json'),
    require('../../../gCore/cronjob/package.json'),
    require('../../../gCore/workflow/package.json'),
    require('../package.json')
];

assert(contracts.registrationBatch.required.includes('registrations'));
assert(routers.registryControl.register.requestBody.required, 'registration body schema must be required');
assert(routers.registryControl.register.responses['200'], 'registration response schema must be declared');
assert(routers.registryDiscovery.bootstrap.responses['200'], 'bootstrap response schema must be declared');
assert(routers.registryDiscovery.diagnostics.responses['200'], 'diagnostics response schema must be declared');

packages.forEach(metadata => {
    assert(service.validateBackofficeMetadata(metadata.nodics.backoffice), metadata.name + ' must own valid BackOffice metadata');
    assert(metadata.nodics.backoffice.requiredPermissions.length > 0, metadata.name + ' metadata must declare discovery permission');
});

let registration = {
    moduleName: 'cms', instanceId: 'runtime-1', clientCallable: true, endpoint: 'https://cms.example/nodics/cms',
    capabilities: ['router'], leaseTtlMs: 30000, backoffice: packages[1].nodics.backoffice
};
assert(service.validateRegistration(registration));
assert(service.validateRegistrationBatch({ instanceId: 'runtime-1', environment: 'resolvedByEnvModule',
    server: 'runtimeComposition', node: null, registrations: [registration] }, 10));
assert.strictEqual(service.validateRegistration(Object.assign({}, registration, { credential: 'must-not-be-accepted' })), false);
assert.strictEqual(service.validateBackofficeMetadata(Object.assign({}, registration.backoffice, { secret: 'invalid' })), false);
assert.strictEqual(service.validateRegistrationBatch({ instanceId: 'other', registrations: [registration] }, 10), false);
console.log('BackOffice API and module catalogue contracts validated');
