/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

/**
 * @module config/test/runtimeLifecycleService
 * @description Validates deterministic state, contributor ordering, idempotency,
 * timeout isolation, and signal ownership for the Nodics runtime lifecycle.
 * @layer test
 * @owner nConfig
 */

let state = 'starting';
global.CONFIG = {
    get: function (name) {
        if (name === 'runtimeLifecycle') return {
            installSignalHandlers: false,
            exitOnSignal: false,
            contributorTimeoutMs: 20,
            shutdownTimeoutMs: 200
        };
        return undefined;
    }
};
global.NODICS = {
    getServerState: function () { return state; },
    setServerState: function (nextState) { state = nextState; }
};

const service = require('../src/service/DefaultRuntimeLifecycleService');

(async function () {
    service.reset();
    let loggedErrors = [];
    service.LOG = { error: function (error) { loggedErrors.push(error); } };
    assert.strictEqual(service.transition('started'), 'started');
    assert.throws(() => service.transition('starting'), /Invalid runtime lifecycle transition/);

    let calls = [];
    service.registerContributor('later', {
        order: 20,
        drain: function () { calls.push('later:drain'); },
        shutdown: function () { calls.push('later:shutdown'); }
    });
    service.registerContributor('earlier', {
        order: 10,
        drain: function () { calls.push('earlier:drain'); },
        shutdown: function () { calls.push('earlier:shutdown'); }
    });
    service.registerContributor('timeout', {
        order: 15,
        timeoutMs: 5,
        drain: function () { return new Promise(() => {}); }
    });
    assert.throws(() => service.registerContributor('earlier', {}), /already registered/);

    let first = service.requestShutdown({ reason: 'test' });
    assert.strictEqual(first, service.requestShutdown({ reason: 'duplicate' }), 'shutdown must be idempotent');
    let result = await first;
    assert.strictEqual(state, 'stopped');
    assert.deepStrictEqual(calls, ['earlier:drain', 'later:drain', 'earlier:shutdown', 'later:shutdown']);
    assert(result.drainResults.some(item => item.name === 'timeout' && item.completed === false));
    assert(loggedErrors.some(error => /timed out/.test(error.message)), 'contributor timeout must be observable');

    service.reset();
    assert.strictEqual(service.installProcessHandlers(), true);
    assert.strictEqual(service.installProcessHandlers(), false, 'signal handlers must have one owner');
    assert(process.listeners('SIGTERM').includes(service._installedHandlers.SIGTERM));
    service.reset();

    console.log('Runtime lifecycle service contract validated');
})().catch(error => {
    service.reset();
    console.error(error);
    process.exit(1);
});
