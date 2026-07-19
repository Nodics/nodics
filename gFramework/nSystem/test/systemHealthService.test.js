/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

/**
 * @module system/test/systemHealthService
 * @description Validates nSystem liveness and readiness responses without
 * starting an HTTP server.
 * @layer test
 * @owner system
 * @override Project modules may add provider-specific readiness tests while
 * preserving low-disclosure liveness and sanitized readiness output.
 */

// @nodics-capability-behavior @nodics-area system

let serverState = 'starting';
let activeModules = [];
let activeTenants = [];
let internalAuthToken;

global.CONFIG = {
    get: function (name) {
        if (name === 'defaultTenant') return 'default';
        if (name === 'readiness') return { contributorTimeoutMs: 10, cacheTtlMs: 1000, degradedIsReady: false };
        return undefined;
    }
};

global.NODICS = {
    getServerState: function () {
        return serverState;
    },
    getEnvironmentName: function () {
        return 'startioLocal';
    },
    getServerName: function () {
        return 'startioLocalServer';
    },
    getNodeName: function () {
        return undefined;
    },
    getActiveModules: function () {
        return activeModules;
    },
    getActiveTenants: function () {
        return activeTenants;
    },
    isNTestRunning: function () {
        return false;
    },
    getInternalAuthToken: function () {
        return internalAuthToken;
    }
};

const service = require('../src/service/health/defaultHealthService');

(async function () {
    let liveResponse = await service.getLiveness({});
    assert.strictEqual(liveResponse.code, 'SUC_SYS_HEALTH_LIVE');
    assert.deepStrictEqual(liveResponse.data, { status: 'UP' });

    service.resetReadinessContributors();
    let notReadyResponse = await service.getReadinessDetails({});
    assert.strictEqual(notReadyResponse.code, 'SUC_SYS_HEALTH_NOT_READY');
    assert.strictEqual(notReadyResponse.data.status, 'DOWN');
    assert.strictEqual(notReadyResponse.data.serverState, 'starting');
    assert.strictEqual(notReadyResponse.data.topology.server, 'startioLocalServer');
    assert.strictEqual(notReadyResponse.data.topology.activeModuleCount, 0);
    assert(notReadyResponse.data.checks.some(check => check.name === 'runtimeState' && check.status === 'DOWN'));
    assert(!JSON.stringify(notReadyResponse).includes('/Users/'));
    assert(!JSON.stringify(notReadyResponse).includes('password'));
    assert(!JSON.stringify(notReadyResponse).includes('token'));

    serverState = 'started';
    activeModules = ['nConfig', 'nSystem'];
    activeTenants = ['default'];
    internalAuthToken = 'not-returned-by-health-response';

    let publicReadyResponse = await service.getReadiness({});
    assert.deepStrictEqual(publicReadyResponse.data, { status: 'UP' });
    assert(!JSON.stringify(publicReadyResponse).includes('not-returned'));

    let readyResponse = await service.getReadinessDetails({});
    assert.strictEqual(readyResponse.code, 'SUC_SYS_HEALTH_READY');
    assert.strictEqual(readyResponse.data.status, 'UP');
    assert.strictEqual(readyResponse.data.topology.activeModuleCount, 2);
    assert.strictEqual(readyResponse.data.topology.activeTenantCount, 1);
    assert.deepStrictEqual(readyResponse.data.checks.map(check => check.status), ['UP', 'UP', 'UP', 'UP', 'UP']);

    serverState = 'draining';
    let drainingResponse = await service.getReadiness({});
    assert.strictEqual(drainingResponse.data.status, 'DOWN', 'draining must immediately remove the process from traffic');

    serverState = 'started';
    service.resetReadinessContributors();
    service.registerReadinessContributor('optionalSearch', { required: false, check: async function () { return false; } });
    let optionalFailure = await service.getReadinessDetails({});
    assert.strictEqual(optionalFailure.data.status, 'UP', 'optional dependency failure must not remove traffic');
    assert(optionalFailure.data.checks.some(check => check.name === 'optionalSearch' && check.status === 'DOWN' && check.required === false));

    service.resetReadinessContributors();
    service.registerReadinessContributor('requiredDatabase', { required: true, check: async function () { return false; } });
    let requiredFailure = await service.getReadiness({});
    assert.strictEqual(requiredFailure.data.status, 'DOWN', 'required dependency failure must remove traffic');

    service.resetReadinessContributors();
    service.registerReadinessContributor('slowDependency', { required: true, timeoutMs: 5, check: function () { return new Promise(() => {}); } });
    let timeoutFailure = await service.getReadinessDetails({});
    assert.strictEqual(timeoutFailure.data.status, 'DOWN');
    assert(timeoutFailure.data.checks.some(check => check.name === 'slowDependency' && check.status === 'DOWN'));
    assert(!JSON.stringify(timeoutFailure).includes('URI'));
    assert(!JSON.stringify(timeoutFailure).includes('token'));

    console.log('System health service behavior validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
