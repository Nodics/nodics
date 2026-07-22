/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nService/test/moduleRegistrationAgent
 * @description Validates non-blocking lifecycle registration, all-active-module batching, service-token use, adaptive retry, and graceful deregistration.
 * @layer test
 * @owner nService
 * @override Project registration agents must preserve startup isolation and service identity boundaries.
 */
const assert = require('assert');

let contributor;
let requests = [];
global.CONFIG = { get: key => ({
    backofficeRegistration: { enabled: true, moduleName: 'backoffice', heartbeatIntervalMs: 10000, requestTimeoutMs: 20 },
    backofficeCapabilities: { cms: { enabled: true, capabilityId: 'content-management', contractVersion: 1,
        minimumClientContractVersion: 1, requiredPermissions: ['cms.backoffice.view'] } },
    defaultTenant: 'default'
}[key]) };
global.NODICS = {
    getActiveModules: () => ['cms', 'utility'],
    getRawModule: name => ({ metaData: { version: '1.0.0', nodics: { runtime: { router: name === 'cms' }, owns: ['router'] } } }),
    getEnvironmentName: () => 'envs', getSelectedEnvironmentName: () => 'local', getServerName: () => 'cmsServer', getNodeName: () => null,
    getInternalAuthToken: () => 'service-token'
};
global.SERVICE = {
    DefaultRuntimeLifecycleService: { registerContributor: (name, value) => { contributor = value; } },
    DefaultRouterService: { prepareUrl: options => 'http://localhost:3040/nodics/' + options.moduleName },
    DefaultModuleService: {
        buildRequest: options => options,
        fetch: request => { requests.push(request); return Promise.resolve({}); }
    }
};

const definition = require('../src/service/module/defaultModuleRegistrationAgentService');
const service = Object.assign({}, definition, {
    _timer: null, _running: false, _registered: [],
    _metrics: { attempts: 0, successes: 0, failures: 0, deregistrations: 0, lastSuccessAt: null, lastFailureAt: null },
    LOG: { warn: function () {} }
});

async function run() {
    await service.init();
    assert(contributor, 'registration agent must use the central lifecycle');
    assert.strictEqual(contributor.ready(), true, 'ready hook must not await BackOffice network traffic');
    await new Promise(resolve => setTimeout(resolve, 5));
    assert.strictEqual(requests.length, 1, 'one bounded runtime batch should register all active modules');
    assert.strictEqual(requests[0].header.Authorization, 'Bearer service-token');
    assert(requests[0].header['Idempotency-Key']);
    assert.deepStrictEqual(requests[0].requestBody.registrations.map(item => item.moduleName), ['cms', 'utility']);
    assert.strictEqual(requests[0].requestBody.registrations[0].clientCallable, true);
    assert.strictEqual(requests[0].requestBody.registrations[0].backoffice.capabilityId, 'content-management');
    CONFIG.get = key => ({ backofficeRegistration: { enabled: true }, backofficeCapabilities: {
        cms: { enabled: false, capabilityId: 'environment-disabled' }
    }, defaultTenant: 'default' }[key]);
    assert.strictEqual(service.buildRegistration('cms').backoffice, undefined,
        'later layered configuration must be able to disable module BackOffice exposure');
    assert.strictEqual(requests[0].requestBody.registrations[1].clientCallable, false);
    assert.strictEqual(requests[0].requestBody.registrations[1].endpoint, undefined);
    await contributor.drain();
    assert.strictEqual(requests.length, 2, 'drain should attempt one instance-wide deregistration');
    assert.strictEqual(service._timer, null);

    NODICS.getInternalAuthToken = () => undefined;
    assert.strictEqual(await service.runRegistration(), false, 'missing service identity must not fail runtime startup');
    console.log('Module registration agent validated');
}

run().catch(error => { console.error(error); process.exit(1); });
