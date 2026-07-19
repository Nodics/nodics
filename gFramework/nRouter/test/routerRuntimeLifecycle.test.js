/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');
const EventEmitter = require('events');

/**
 * @module nRouter/test/routerRuntimeLifecycle
 * @description Validates listener readiness ownership and lifecycle draining
 * without opening real network ports.
 * @layer test
 * @owner nRouter
 */

let registeredContributor;
global.SERVICE = {
    DefaultRuntimeLifecycleService: {
        registerContributor: function (name, contributor) {
            registeredContributor = { name, contributor };
        }
    }
};

const routerService = require('../src/service/router/defaultRouterService');
routerService.LOG = { info: function () {}, error: function () {} };
routerService.runtimeServers = [];
routerService.lifecycleContributorRegistered = false;

class FakeServer extends EventEmitter {
    constructor() {
        super();
        this.listening = false;
        this.idleClosed = false;
        this.allClosed = false;
    }

    listen() {
        this.listening = true;
        process.nextTick(() => this.emit('listening'));
    }

    close(callback) {
        this.listening = false;
        process.nextTick(() => callback());
    }

    closeIdleConnections() {
        this.idleClosed = true;
    }

    closeAllConnections() {
        this.allClosed = true;
    }
}

(async function () {
    let moduleConfig = {
        running: false,
        setIsServerRunning: function (running) { this.running = running; }
    };
    let server = new FakeServer();
    await routerService.startListener('default', 3000, false, server, moduleConfig);
    assert.strictEqual(server.listening, true, 'listener promise must resolve after listening');
    assert.strictEqual(routerService.runtimeServers.length, 1, 'listener handle must be retained');

    assert.strictEqual(routerService.registerLifecycleContributor(), true);
    assert.strictEqual(routerService.registerLifecycleContributor(), false, 'router lifecycle contributor must be unique');
    assert.strictEqual(registeredContributor.name, 'httpListeners');

    await registeredContributor.contributor.drain();
    assert.strictEqual(server.listening, false, 'drain must stop accepting traffic');
    assert.strictEqual(server.idleClosed, true, 'drain must close idle keep-alive connections');
    await registeredContributor.contributor.shutdown();
    assert.strictEqual(server.allClosed, true, 'shutdown must force-close remaining connections');

    console.log('Router runtime lifecycle contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
