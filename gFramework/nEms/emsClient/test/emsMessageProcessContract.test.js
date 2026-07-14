/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nEms/emsClient/test/emsMessageProcessContract.test
 * @description Validates consumed EMS message translation, tenant validation, and local versus remote event dispatch behavior.
 * @layer test
 * @owner nEms
 * @override Project modules may add message handler or provider-specific consume tests while preserving this event dispatch contract.
 */

const assert = require('assert');

const pipelineCalls = [];
const handledEvents = [];
const publishedEvents = [];

global.CONFIG = {
    get: function (key) {
        if (key === 'emsClient') {
            return {
                messageHandlers: {
                    jsonMessageHandler: 'jsonMessageHandlerPipeline'
                }
            };
        }
        if (key === 'nodeId') {
            return 'testNode';
        }
        if (key === 'defaultTenant') {
            return 'default';
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

global.CLASSES = {
    NodicsError
};

global.NODICS = {
    isModuleActive: function (moduleName) {
        return moduleName === 'localTarget';
    }
};

global.SERVICE = {
    DefaultPipelineService: {
        start: function (pipelineName, request, response) {
            pipelineCalls.push({ pipelineName, request, response });
            return Promise.resolve({
                success: true,
                result: Object.assign({ translated: true }, request.message)
            });
        }
    },
    DefaultEventService: {
        handleEvent: function (request) {
            handledEvents.push(request);
            return Promise.resolve(true);
        },
        publish: function (event) {
            publishedEvents.push(event);
            return Promise.resolve(true);
        }
    }
};

const messageProcessService = require('../src/service/proc/defaultMessageProcessService');
messageProcessService.LOG = {
    debug: function () {},
    error: function () {}
};

function createProcess() {
    return {
        nextCount: 0,
        errorValue: undefined,
        nextSuccess: function () {
            this.nextCount++;
        },
        error: function (request, response, error) {
            this.errorValue = error;
        }
    };
}

async function runAsyncStep(stepName, request, response) {
    const process = createProcess();
    messageProcessService[stepName](request, response, process);
    await new Promise((resolve) => setImmediate(resolve));
    return process;
}

(async function run() {
    let process = createProcess();
    messageProcessService.validateRequest({ message: {} }, {}, process);
    assert.strictEqual(process.errorValue.code, 'ERR_EMS_00000', 'consume validation should require queue detail');

    const request = {
        queue: {
            name: 'orderCreated',
            options: {
                messageHandler: 'jsonMessageHandler',
                target: 'localTarget',
                source: 'ems',
                eventType: 'DOMAIN',
                header: {
                    correlationId: 'corr-1'
                }
            }
        },
        message: {
            tenant: 'default',
            code: 'order-1'
        }
    };

    process = await runAsyncStep('processMessage', request, {});
    assert.strictEqual(process.nextCount, 1, 'consume process should continue after handler translation');
    assert.strictEqual(pipelineCalls[0].pipelineName, 'jsonMessageHandlerPipeline', 'consume process should use configured message handler pipeline');
    assert.strictEqual(request.message.translated, true, 'consume process should replace the message with translated data');

    process = createProcess();
    messageProcessService.validateData(request, {}, process);
    assert.strictEqual(process.nextCount, 1, 'consume data validation should accept message tenant');

    process = await runAsyncStep('publishEvent', request, {});
    assert.strictEqual(process.nextCount, 1, 'local target event dispatch should continue');
    assert.strictEqual(handledEvents[0].tenant, 'default', 'local target dispatch should use message tenant');
    assert.strictEqual(handledEvents[0].event.event, 'orderCreated', 'local target dispatch should use queue name when event name is not overridden');
    assert.strictEqual(handledEvents[0].event.sourceId, 'testNode', 'local target dispatch should include source node');

    const remoteRequest = {
        queue: {
            name: 'invoiceCreated',
            options: {
                target: 'remoteTarget',
                eventName: 'invoice.ready',
                eventType: 'DOMAIN'
            }
        },
        message: {
            tenant: 'default',
            code: 'invoice-1'
        }
    };

    process = await runAsyncStep('publishEvent', remoteRequest, {});
    assert.strictEqual(process.nextCount, 1, 'remote target event publish should continue');
    assert.strictEqual(publishedEvents[0].event, 'invoice.ready', 'remote target publish should honor configured event name');
    assert.strictEqual(publishedEvents[0].target, 'remoteTarget', 'remote target publish should preserve target module');

    process = createProcess();
    messageProcessService.validateData({
        queue: {
            name: 'tenantRequired',
            options: {}
        },
        message: {}
    }, {}, process);
    assert.strictEqual(process.errorValue.code, 'ERR_EMS_00000', 'consume data validation should fail when tenant cannot be resolved');

    console.log('EMS message process contract validated: consume translation, tenant validation, event dispatch');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
