/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nEms/emsClient/test/emsClientServiceContract.test
 * @description Validates deterministic EMS client publish, register, close, and invalid request behavior without requiring a live broker.
 * @layer test
 * @owner nEms
 * @override Project modules may add provider-specific EMS integration tests while preserving this broker-neutral client contract.
 */

const assert = require('assert');

const emsClientConfig = {
    consumers: {
        knownConsumer: {
            enabled: true,
            client: 'testClient',
            runOnNode: 'testNode'
        }
    },
    publishers: {
        knownPublisher: {
            enabled: true,
            client: 'testClient',
            runOnNode: 'testNode'
        }
    }
};

const calls = {
    publishes: [],
    registeredConsumers: [],
    registeredPublishers: [],
    closedConsumers: [],
    closedPublishers: []
};

global.UTILS = {
    isBlank: function (value) {
        return value === undefined || value === null || value === '' ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'object' && Object.keys(value).length === 0);
    }
};

global.CONFIG = {
    get: function (key) {
        if (key === 'emsClient') {
            return emsClientConfig;
        }
        if (key === 'nodeId') {
            return 'testNode';
        }
        return undefined;
    }
};

class NodicsError extends Error {
    constructor(code, message, fallbackCode) {
        if (code instanceof Error) {
            super(message || code.message);
            this.code = fallbackCode || code.code;
        } else {
            super(message || code);
            this.code = code;
        }
    }
}

const publisherMap = {
    knownPublisher: {
        client: {
            config: {
                handler: 'DefaultTestEmsHandlerService'
            }
        }
    }
};

global.CLASSES = {
    NodicsError
};

global.SERVICE = {
    DefaultTestEmsHandlerService: {
        publish: function (payload) {
            calls.publishes.push(payload);
            return Promise.resolve({
                code: 'SUC_EMS_00000',
                result: payload.queue
            });
        }
    },
    DefaultNodicsPromiseService: {
        all: function (promises) {
            return Promise.all(promises).then(success => ({
                success,
                errors: []
            }));
        }
    },
    DefaultEmsClientConfigurationService: {
        getPublisher: function (queueName) {
            return publisherMap[queueName];
        },
        registerConsumer: function (consumerList, consumers) {
            calls.registeredConsumers.push({ consumerList: consumerList.slice(), consumers });
            return Promise.resolve(true);
        },
        configurePublisher: function (publisherList, publishers) {
            calls.registeredPublishers.push({ publisherList: publisherList.slice(), publishers });
            return Promise.resolve(true);
        },
        closeConsumers: function (consumers) {
            calls.closedConsumers.push(consumers.slice());
            return Promise.resolve({
                code: 'SUC_SYS_00000',
                result: consumers
            });
        },
        closePublishers: function (publishers) {
            calls.closedPublishers.push(publishers.slice());
            return Promise.resolve({
                code: 'SUC_SYS_00000',
                result: publishers
            });
        }
    }
};

const emsClientService = require('../src/service/ems/defaultEmsClientService');

(async function run() {
    await assert.rejects(
        () => emsClientService.publish({}),
        (error) => error.code === 'ERR_EMS_00002',
        'publish should reject missing payloads'
    );

    let publishResult = await emsClientService.publish({
        payloads: {
            queue: 'knownPublisher',
            message: { tenant: 'default', code: 'single' }
        }
    });
    assert.strictEqual(publishResult.code, 'SUC_EMS_00000', 'single publish should delegate to provider handler');
    assert.strictEqual(calls.publishes[0].queue, 'knownPublisher', 'single publish should pass original payload');

    let batchResult = await emsClientService.publish({
        payloads: [
            { queue: 'knownPublisher', message: { tenant: 'default', code: 'batch-ok' } },
            { queue: 'missingPublisher', message: { tenant: 'default', code: 'batch-fail' } }
        ]
    });
    assert.strictEqual(batchResult.code, 'SUC_EMS_00000', 'batch publish should resolve with EMS success envelope');
    assert.strictEqual(batchResult.result.length, 1, 'batch publish should include successful provider responses');
    assert.strictEqual(batchResult.failed.length, 1, 'batch publish should capture invalid queue failures');

    let consumerResult = await emsClientService.registerConsumers({
        consumers: ['knownConsumer']
    });
    assert.strictEqual(consumerResult.code, 'SUC_EMS_00000', 'configured consumer registration should return EMS success');
    assert.deepStrictEqual(consumerResult.result, ['knownConsumer'], 'configured consumer registration should report registered names');
    assert.deepStrictEqual(calls.registeredConsumers[0].consumerList, ['knownConsumer'], 'configured consumer registration should delegate by name');

    await assert.rejects(
        () => emsClientService.registerConsumers({ consumers: ['missingConsumer'] }),
        (error) => error.code === 'ERR_EMS_00000',
        'unknown configured consumer should fail closed'
    );

    let dynamicConsumer = {
        dynamicConsumer: {
            enabled: true,
            client: 'testClient',
            runOnNode: 'testNode'
        }
    };
    let dynamicConsumerResult = await emsClientService.registerConsumers({
        consumers: dynamicConsumer
    });
    assert.deepStrictEqual(dynamicConsumerResult.result, ['dynamicConsumer'], 'dynamic consumer registration should report dynamic names');
    assert.deepStrictEqual(emsClientConfig.consumers.dynamicConsumer, dynamicConsumer.dynamicConsumer, 'dynamic consumer config should be retained');

    let dynamicPublisher = {
        dynamicPublisher: {
            enabled: true,
            client: 'testClient',
            runOnNode: 'testNode'
        }
    };
    let dynamicPublisherResult = await emsClientService.registerPublishers({
        publishers: dynamicPublisher
    });
    assert.deepStrictEqual(dynamicPublisherResult.result, ['dynamicPublisher'], 'dynamic publisher registration should report dynamic names');
    assert.deepStrictEqual(emsClientConfig.publishers.dynamicPublisher, dynamicPublisher.dynamicPublisher, 'dynamic publisher config should be retained');

    await assert.rejects(
        () => emsClientService.closeConsumers({ consumers: [] }),
        (error) => error.code === 'ERR_EMS_00005',
        'close consumers should reject an empty list'
    );

    let closeConsumerResult = await emsClientService.closeConsumers({
        consumers: ['knownConsumer']
    });
    assert.strictEqual(closeConsumerResult.code, 'SUC_SYS_00000', 'close consumers should delegate to configuration service');
    assert.deepStrictEqual(calls.closedConsumers[0], ['knownConsumer'], 'close consumers should pass requested names');

    let closePublisherResult = await emsClientService.closePublishers({
        publishers: ['knownPublisher']
    });
    assert.strictEqual(closePublisherResult.code, 'SUC_SYS_00000', 'close publishers should delegate to configuration service');
    assert.deepStrictEqual(calls.closedPublishers[0], ['knownPublisher'], 'close publishers should pass requested names');

    console.log('EMS client service contract validated: publish, register, close, invalid paths');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
