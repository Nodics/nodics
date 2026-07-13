/**
 * @module gFramework/nDynamo/test/classConfigurationServiceContract.test
 * @description Validates persisted and runtime class configuration behavior for dynamic Nodics service classes.
 * @layer test
 * @owner nDynamo
 * @override Projects may add focused dynamic-class fixtures beside this test while preserving class configuration contracts.
 */
const assert = require('assert');
const service = require('../src/service/class/defaultClassConfigurationService');

if (!String.prototype.toUpperCaseFirstChar) {
    Object.defineProperty(String.prototype, 'toUpperCaseFirstChar', {
        /**
         * Executes value behavior.
         *
         * @returns {*} Method result.
         */
        value: function () {
            return this.charAt(0).toUpperCase() + this.slice(1);
        }
    });
}

class NodicsError extends Error {
    constructor(code, message) {
        super(message || String(code));
        this.code = code;
    }
}

function resetGlobals() {
    global.CONFIG = {
        /**
         * Retrieves  information.
         *
         * @param {*} key Method input.
         * @returns {*} Method result.
         */
        get: function (key) {
            return key === 'defaultTenant' ? 'default' : undefined;
        }
    };
    global.CLASSES = {
        NodicsError: NodicsError
    };
    global.SERVICE = {
        DefaultClassConfigurationService: service
    };
    global.GLOBAL = global;
    service.LOG = {
        /**
         * Records debug output for the test fixture.
         *
         * @returns {*} Method result.
         */
        debug: function () { },
        /**
         * Records warn output for the test fixture.
         *
         * @returns {*} Method result.
         */
        warn: function () { },
        /**
         * Records error output for the test fixture.
         *
         * @returns {*} Method result.
         */
        error: function () { }
    };
}

function setPersistedBody(body) {
    service.get = function () {
        if (!body) {
            return Promise.resolve({ result: [] });
        }
        return Promise.resolve({
            result: [{
                code: 'defaultDynamicClassService',
                type: 'SERVICE',
                body: Buffer.from(body, 'utf8')
            }]
        });
    };
}

async function run() {
    resetGlobals();
    setPersistedBody('module.exports = { ping: function () { return "pong"; } };');
    const classBody = await service.getClass({ className: 'defaultDynamicClassService' });
    assert(classBody.includes('module.exports = { ping: function () { return pong; } };'));

    resetGlobals();
    setPersistedBody(null);
    const missingBody = await service.getClass({ className: 'defaultDynamicClassService' });
    assert.strictEqual(missingBody, 'No data found for class: defaultDynamicClassService');

    resetGlobals();
    global.SERVICE.DefaultDynamicClassService = {
        status: 'ready',
        /**
         * Executes ping behavior.
         *
         * @returns {*} Method result.
         */
        ping: function () {
            return 'pong';
        }
    };
    const snapshot = await service.getSnapshot({
        type: 'SERVICE',
        className: 'defaultDynamicClassService'
    });
    assert(snapshot.startsWith('module.exports = '));
    assert(snapshot.includes('ping: function'));
    assert(snapshot.includes("status: 'ready'"));

    resetGlobals();
    setPersistedBody(null);
    const finalizedBody = await service.finalizeClass('defaultDynamicClassService', '{ ping: function () { return "pong"; } }');
    assert(Buffer.isBuffer(finalizedBody));
    assert(finalizedBody.toString('utf8').startsWith('module.exports = { ping: function ()'));

    resetGlobals();
    setPersistedBody(null);
    let savedRequest = null;
    service.save = function (request) {
        savedRequest = request;
        return Promise.resolve({ status: 'saved' });
    };
    const updateResult = await service.updateClass({
        className: 'defaultDynamicClassService',
        type: 'SERVICE',
        body: '{ ping: function () { return "pong"; } }'
    });
    assert.deepStrictEqual(updateResult, { status: 'saved' });
    assert.strictEqual(savedRequest.tenant, 'default');
    assert.strictEqual(savedRequest.model.code, 'defaultDynamicClassService');
    assert.strictEqual(savedRequest.model.type, 'SERVICE');
    assert.strictEqual(savedRequest.model.active, true);
    assert(Buffer.isBuffer(savedRequest.model.body));

    resetGlobals();
    global.SERVICE.DefaultDynamicClassService = {
        /**
         * Executes sum behavior.
         *
         * @param {*} first Method input.
         * @param {*} second Method input.
         * @returns {*} Method result.
         */
        sum: function (first, second) {
            return first + second;
        },
        /**
         * Executes async ping behavior.
         *
         * @returns {*} Method result.
         */
        asyncPing: function () {
            return Promise.resolve('pong');
        }
    };
    const syncExecution = await service.executeClass({
        body: {
            type: 'SERVICE',
            className: 'defaultDynamicClassService',
            operationName: 'sum',
            params: [2, 3]
        }
    });
    assert.strictEqual(syncExecution.response, 5);

    const asyncExecution = await service.executeClass({
        body: {
            type: 'SERVICE',
            className: 'defaultDynamicClassService',
            operationName: 'asyncPing',
            isReturnPromise: true
        }
    });
    assert.strictEqual(asyncExecution, 'pong');
}

run().then(() => {
    console.log('Dynamo class configuration service contract validated');
}).catch(error => {
    console.error(error);
    process.exit(1);
});
