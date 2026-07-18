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
    }
};

const service = require('../src/service/health/defaultHealthService');

(async function () {
    let liveResponse = await service.getLiveness({});
    assert.strictEqual(liveResponse.code, 'SUC_SYS_HEALTH_LIVE');
    assert.deepStrictEqual(liveResponse.data, { status: 'UP' });

    let notReadyResponse = await service.getReadiness({});
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

    let readyResponse = await service.getReadiness({});
    assert.strictEqual(readyResponse.code, 'SUC_SYS_HEALTH_READY');
    assert.strictEqual(readyResponse.data.status, 'UP');
    assert.strictEqual(readyResponse.data.topology.activeModuleCount, 2);
    assert.strictEqual(readyResponse.data.topology.activeTenantCount, 1);
    assert.deepStrictEqual(readyResponse.data.checks.map(check => check.status), ['UP', 'UP', 'UP', 'UP']);

    console.log('System health service behavior validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
