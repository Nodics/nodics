/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/workflow/flowCore/test/workflowEventContinuationContract.test
 * @description Validates workflow event continuation by bridging initiation events to carrier initialization and listener callback aggregation.
 * @layer test
 * @owner workflow
 * @override Project modules may add event-driven workflow continuation tests in their own module boundaries while preserving this base event bridge contract.
 */

const assert = require('assert');

class WorkflowError extends Error {
    constructor(code, message) {
        super(message || code);
        this.code = message ? code : undefined;
    }
}

class EventError extends Error {
    constructor(error, message, code) {
        super(message || (error && error.message) || String(error));
        this.code = code;
        this.errors = [error];
    }

    add(error) {
        this.errors.push(error);
    }
}

global.CLASSES = {
    WorkflowError,
    EventError
};

const pipelineCalls = [];

global.SERVICE = {
    DefaultPipelineService: {
        start: function (pipelineName, request, response) {
            pipelineCalls.push({ pipelineName, request, response });
            if (request.workflowCode === 'failingWorkflow') {
                return Promise.reject(new WorkflowError('ERR_WF_TEST', 'failing workflow'));
            }
            return Promise.resolve({
                workflowCode: request.workflowCode,
                carrierCode: request.carrier && request.carrier.code,
                tenant: request.tenant
            });
        }
    },
    DefaultNodicsPromiseService: {
        all: function (promises, response = {}) {
            return new Promise((resolve, reject) => {
                const runNext = () => {
                    if (promises.length <= 0) {
                        resolve(response);
                        return;
                    }
                    const promise = promises.shift();
                    promise.then(success => {
                        if (!response.success) response.success = [];
                        response.success.push(success);
                        runNext();
                    }).catch(error => {
                        if (!response.errors) response.errors = [];
                        response.errors.push(error);
                        runNext();
                    });
                };
                runNext();
            });
        }
    }
};

const workflowService = require('../src/service/workflow/defaultWorkflowService');
const workflowCarrierChangeListener = require('../src/service/events/defaultWorkflowCarrierChangeListenerService');
SERVICE.DefaultWorkflowService = workflowService;

async function callListener(request) {
    return new Promise((resolve) => {
        workflowCarrierChangeListener.handleItemChangeEvent(request, (error, result) => {
            resolve({ error, result });
        });
    });
}

(async function run() {
    pipelineCalls.length = 0;
    let response = await workflowService.handleItemChangeEvent({
        tenant: 'requestTenant',
        authData: { user: 'tester' },
        event: {
            tenant: 'eventTenant',
            data: [
                {
                    workflowCode: 'contactWorkflow',
                    releaseCarrier: true,
                    carrier: { code: 'contact-1' }
                },
                {
                    workflowCode: 'orderWorkflow',
                    tenant: 'carrierTenant',
                    carrier: { code: 'order-1' }
                }
            ]
        }
    });

    assert.strictEqual(response.errors, undefined, 'successful event continuation should not return errors');
    assert.deepStrictEqual(response.result.map(result => result.result.workflowCode), ['contactWorkflow', 'orderWorkflow'], 'event continuation should initialize each workflow carrier');
    assert.deepStrictEqual(pipelineCalls.map(call => call.pipelineName), ['initWorkflowCarrierPipeline', 'initWorkflowCarrierPipeline'], 'event continuation should dispatch carrier initialization');
    assert.strictEqual(pipelineCalls[0].request.tenant, 'eventTenant', 'event tenant should be used when present');
    assert.strictEqual(pipelineCalls[1].request.tenant, 'carrierTenant', 'carrier tenant should override event tenant when the event item declares one');
    assert.strictEqual(pipelineCalls[0].request.releaseCarrier, true, 'event releaseCarrier flag should flow to carrier initialization');

    pipelineCalls.length = 0;
    response = await workflowService.handleItemChangeEvent({
        tenant: 'requestTenant',
        authData: { user: 'tester' },
        event: {
            data: [
                {
                    workflowCode: 'contactWorkflow',
                    carrier: { code: 'contact-1' }
                },
                {
                    workflowCode: 'failingWorkflow',
                    carrier: { code: 'broken-1' }
                }
            ]
        }
    });

    assert.strictEqual(response.result.length, 1, 'partial event continuation should retain successful initializations');
    assert.strictEqual(response.errors.length, 1, 'partial event continuation should collect failed initializations');
    assert.strictEqual(response.errors[0].code, 'ERR_WF_TEST', 'partial event continuation should preserve workflow error code');

    let listenerResult = await callListener({
        tenant: 'requestTenant',
        authData: { user: 'tester' },
        event: {
            data: [
                {
                    workflowCode: 'contactWorkflow',
                    carrier: { code: 'contact-2' }
                }
            ]
        }
    });

    assert.strictEqual(listenerResult.error, null, 'listener should callback without error when all workflow initializations succeed');
    assert.strictEqual(listenerResult.result.length, 1, 'listener should return successful workflow initializations');

    listenerResult = await callListener({
        tenant: 'requestTenant',
        authData: { user: 'tester' },
        event: {
            data: [
                {
                    workflowCode: 'contactWorkflow',
                    carrier: { code: 'contact-3' }
                },
                {
                    workflowCode: 'failingWorkflow',
                    carrier: { code: 'broken-2' }
                }
            ]
        }
    });

    assert(listenerResult.error instanceof EventError, 'listener should convert partial workflow failures to EventError');
    assert.strictEqual(listenerResult.error.metadata.result.length, 1, 'listener error metadata should retain successful workflow initializations');
    assert.strictEqual(listenerResult.error.errors.length, 1, 'listener error should contain collected workflow errors');

    listenerResult = await callListener({
        tenant: 'requestTenant',
        authData: { user: 'tester' },
        event: {
            data: []
        }
    });

    assert.strictEqual(listenerResult.error, null, 'empty event continuation should not fail');
    assert.deepStrictEqual(listenerResult.result, undefined, 'empty event continuation should return no result payload');

    console.log('Workflow event continuation contract validated: event bridge, aggregation, listener callback');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
