const assert = require('assert');
const controller = require('../src/controller/class/defaultClassConfigurationController');

function createRequest(params, body) {
    return {
        httpRequest: {
            params: params || {},
            body: body
        }
    };
}

function withFacade(operation, response, assertion) {
    let capturedRequest = null;
    global.FACADE = {
        DefaultClassConfigurationFacade: {
            getClass: function (request) {
                capturedRequest = request;
                return Promise.resolve(response || true);
            },
            getSnapshot: function (request) {
                capturedRequest = request;
                return Promise.resolve(response || true);
            },
            updateClass: function (request) {
                capturedRequest = request;
                return Promise.resolve(response || true);
            },
            executeClass: function (request) {
                capturedRequest = request;
                return Promise.resolve(response || true);
            }
        }
    };

    return assertion(function () {
        return capturedRequest;
    }, operation);
}

async function run() {
    await withFacade('getClass', 'class-body', async getCaptured => {
        const result = await controller.getClass(createRequest({ className: 'defaultDynamicClassService' }));
        assert.strictEqual(result, 'class-body');
        assert.strictEqual(getCaptured().className, 'defaultDynamicClassService');
    });

    await withFacade('getSnapshot', 'snapshot-body', async getCaptured => {
        const result = await controller.getSnapshot(createRequest({
            type: 'SERVICE',
            className: 'defaultDynamicClassService'
        }));
        assert.strictEqual(result, 'snapshot-body');
        assert.strictEqual(getCaptured().type, 'SERVICE');
        assert.strictEqual(getCaptured().className, 'defaultDynamicClassService');
    });

    await withFacade('updateClass', { status: 'updated' }, async getCaptured => {
        const body = '{ ping: function () { return "pong"; } }';
        const result = await controller.updateClass(createRequest({
            type: 'SERVICE',
            className: 'defaultDynamicClassService'
        }, body));
        assert.deepStrictEqual(result, { status: 'updated' });
        assert.strictEqual(getCaptured().type, 'SERVICE');
        assert.strictEqual(getCaptured().className, 'defaultDynamicClassService');
        assert.strictEqual(getCaptured().body, body);
    });

    await withFacade('executeClass', { response: 'pong' }, async getCaptured => {
        const body = {
            type: 'SERVICE',
            className: 'defaultDynamicClassService',
            operationName: 'ping',
            params: []
        };
        const result = await controller.executeClass(createRequest({}, body));
        assert.deepStrictEqual(result, { response: 'pong' });
        assert.deepStrictEqual(getCaptured().body, body);
    });
}

run().then(() => {
    console.log('Dynamo class configuration controller request mapping validated');
}).catch(error => {
    console.error(error);
    process.exit(1);
});
