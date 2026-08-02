/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const defaults = require('../config/properties').aiProviders;
const controlService = require('../src/service/control/defaultAiProviderControlService');

function configuration() {
    return JSON.parse(JSON.stringify(defaults));
}

const base = {
    profileCode: 'assistantGeneration',
    providerCode: 'openAi',
    modelCode: 'model',
    capability: 'GENERATION'
};

assert.throws(() => controlService.assertEnabled(Object.assign({}, base, {
    configuration: Object.assign(configuration(), {
        controls: Object.assign(configuration().controls, {
            killSwitches: Object.assign(configuration().controls.killSwitches, { global: true })
        })
    })
})), /global kill switch/);

const tenantStopped = configuration();
tenantStopped.controls.killSwitches.tenants.customerA = true;
assert.throws(() => controlService.assertEnabled(Object.assign({}, base, {
    configuration: tenantStopped,
    context: { tenantCode: 'customerA' }
})), /tenant kill switch/);

let request;
Promise.resolve(controlService.authorize(Object.assign({}, base, {
    configuration: configuration(),
    context: {
        tenantCode: 'default',
        principalCode: 'employee-1',
        rateLimitCache: {
            incrementBounded: value => {
                request = value;
                return { allowed: true, value: 1, maximum: 60 };
            }
        }
    }
}))).then(result => {
    assert.strictEqual(result.used, 1);
    assert.strictEqual(request.moduleName, 'aiProviders');
    assert.strictEqual(request.channelName, 'rateLimit');
    assert.strictEqual(request.maximum, 60);
    return assert.rejects(controlService.authorize(Object.assign({}, base, {
        configuration: configuration(),
        context: {
            rateLimitCache: {
                incrementBounded: () => ({ allowed: false, value: 60, maximum: 60 })
            }
        }
    })), /rate limit exceeded/);
}).then(() => assert.rejects(controlService.authorize(Object.assign({}, base, {
    configuration: configuration(),
    context: {}
})), /cache is unavailable/)).then(() => {
    console.log('AI provider operational controls contract tests passed');
});
