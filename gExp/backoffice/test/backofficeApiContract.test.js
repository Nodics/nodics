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

const capabilities = [
    require('../../../gCore/profile/config/properties').backofficeCapabilities.profile,
    require('../../../gContent/cms/config/properties').backofficeCapabilities.cms,
    require('../../../gCore/cronjob/config/properties').backofficeCapabilities.cronjob,
    require('../../../gCore/workflow/config/properties').backofficeCapabilities.workflow,
    require('../../../gComm/pricing/config/properties').backofficeCapabilities.pricing,
    require('../config/properties').backofficeCapabilities.backoffice
];

assert(contracts.registrationBatch.required.includes('registrations'));
assert(contracts.capabilitySnapshot.required.includes('hash'));
assert(contracts.capabilitySnapshot.properties.changeClassification.enum.includes('BREAKING'));
assert(contracts.bootstrapData.properties.uiComposition.required.includes('fallbackMode'));
assert.deepStrictEqual(contracts.moduleAvailability.properties.state.enum, ['UP', 'DEGRADED', 'UNAVAILABLE', 'UNKNOWN']);
assert(contracts.moduleAvailability.required.includes('unknownInstances'));
assert(contracts.adminDetailData.properties.instances.items.properties.environment);
assert(contracts.adminDetailData.properties.instances.items.properties.server);
assert(contracts.adminDetailData.properties.instances.items.properties.node);
assert(contracts.adminDetailData.properties.instances.items.properties.clientCallable);
assert(routers.registryControl.register.requestBody.required, 'registration body schema must be required');
assert(routers.registryControl.register.responses['200'], 'registration response schema must be declared');
assert(routers.registryDiscovery.bootstrap.responses['200'], 'bootstrap response schema must be declared');
assert(routers.registryDiscovery.diagnostics.responses['200'], 'diagnostics response schema must be declared');

capabilities.forEach(metadata => {
    assert(service.validateBackofficeMetadata(metadata), metadata.capabilityId + ' must own valid BackOffice metadata');
    assert(metadata.requiredPermissions.length > 0, metadata.capabilityId + ' metadata must declare discovery permission');
    assert(metadata.roles.length > 0, metadata.capabilityId + ' metadata must declare BackOffice provider roles');
    assert(metadata.discovery.openApiPath.startsWith('/'), metadata.capabilityId + ' discovery path must remain relative');
});
assert(capabilities[1].roles.includes('UI_COMPOSITION_PROVIDER'));
assert.strictEqual(capabilities[1].uiComposition.fallbackMode, 'STATIC_RECOVERY_SHELL');

let registration = {
    moduleName: 'cms', instanceId: 'runtime-1', clientCallable: true, endpoint: 'https://cms.example/nodics/cms',
    capabilities: ['router'], leaseTtlMs: 30000, backoffice: capabilities[1]
};
assert(service.validateRegistration(registration));
assert(service.validateRegistrationBatch({ instanceId: 'runtime-1', environment: 'resolvedByEnvModule',
    server: 'runtimeComposition', node: null, registrations: [registration] }, 10));
assert.strictEqual(service.validateRegistration(Object.assign({}, registration, { credential: 'must-not-be-accepted' })), false);
assert.strictEqual(service.validateRegistration(Object.assign({}, registration, { healthPath: 'https://evil.example/ready' })), false);
assert.strictEqual(service.validateBackofficeMetadata(Object.assign({}, registration.backoffice, { secret: 'invalid' })), false);
assert.strictEqual(service.validateBackofficeMetadata(Object.assign({}, registration.backoffice, { roles: ['UNKNOWN_PROVIDER'] })), false);
assert.strictEqual(service.validateBackofficeMetadata(Object.assign({}, registration.backoffice, {
    roles: ['FUNCTIONAL_CAPABILITY_PROVIDER'], uiComposition: capabilities[1].uiComposition
})), false);
assert.strictEqual(service.validateRegistrationBatch({ instanceId: 'other', registrations: [registration] }, 10), false);
console.log('BackOffice API and module catalogue contracts validated');
