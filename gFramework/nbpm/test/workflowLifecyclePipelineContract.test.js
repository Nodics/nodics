/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nbpm/test/workflowLifecyclePipelineContract.test
 * @description Validates nbpm workflow lifecycle event wiring, interceptor-provided default events, listener dispatch, and move pipeline hook structure.
 * @layer test
 * @owner nbpm
 * @override Project modules may extend lifecycle event wiring through layered workflow2Schema configuration while preserving the nbpm pipeline contract.
 */

const assert = require('assert');

if (!String.prototype.toUpperCaseFirstChar) {
    Object.defineProperty(String.prototype, 'toUpperCaseFirstChar', {
        value: function () {
            return this.charAt(0).toUpperCase() + this.slice(1);
        }
    });
}

const defaultWorkflowConfig = require('../config/properties').defaultWorkflowConfig;
const pipelines = require('../src/pipelines/pipelines');
const workflow2SchemaInterceptor = require('../src/service/interceptors/defaultSaveWorkflow2SchemaInterceptorService');

const pipelineCalls = [];

global.CONFIG = {
    get: function (key) {
        if (key === 'defaultWorkflowConfig') {
            return defaultWorkflowConfig;
        }
        if (key === 'clusterId') {
            return 'testCluster';
        }
        return undefined;
    }
};

global.CLASSES = {
    EventError: class EventError extends Error {
        constructor(error, message, code) {
            super(message);
            this.cause = error;
            this.code = code;
        }
    },
    WorkflowError: class WorkflowError extends Error {
        constructor(code, message) {
            super(message || code);
            this.code = message ? code : undefined;
        }
    }
};

global.SERVICE = {
    DefaultWorkflowEventService: require('../src/service/event/defaultWorkflowEventService'),
    DefaultPipelineService: {
        start: function (pipelineName, request, response) {
            pipelineCalls.push({ pipelineName, request, response });
            return Promise.resolve({ pipelineName });
        }
    }
};

const lifecycleEvents = {
    workflowCarrierReleased: {
        event: 'carrierReleased',
        pipeline: 'defaultWorkflowCarrierReleasedPipeline',
        listenerModule: '../src/service/event/handlers/carrier/defaultWorkflowCarrierReleasedEventListenerService',
        listenerMethod: 'handleWorkflowCarrierReleasedEvent'
    },
    workflowCarrierBlocked: {
        event: 'carrierBlocked',
        pipeline: 'defaultWorkflowCarrierBlockedPipeline',
        listenerModule: '../src/service/event/handlers/carrier/defaultWorkflowCarrierBlockedEventListenerService',
        listenerMethod: 'handleWorkflowCarrierBlockedEvent'
    },
    workflowCarrierPaused: {
        event: 'carrierPaused',
        pipeline: 'defaultWorkflowCarrierPausedPipeline',
        listenerModule: '../src/service/event/handlers/carrier/defaultWorkflowCarrierPausedEventListenerService',
        listenerMethod: 'handleWorkflowCarrierPausedEvent'
    },
    workflowCarrierResumed: {
        event: 'carrierResumed',
        pipeline: 'defaultWorkflowCarrierResumedPipeline',
        listenerModule: '../src/service/event/handlers/carrier/defaultWorkflowCarrierResumedEventListenerService',
        listenerMethod: 'handleWorkflowCarrierResumedEvent'
    }
};

function invokeListener(listener, method, event) {
    return new Promise((resolve, reject) => {
        listener[method]({ event }, (error, result) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(result);
        });
    });
}

(async function run() {
    const request = {
        model: {
            schemaName: 'order',
            workflowCode: 'approval'
        }
    };

    await workflow2SchemaInterceptor.handlePreSaveAssignedDefaultEvents(request, {});

    Object.keys(lifecycleEvents).forEach((eventKey) => {
        const expected = lifecycleEvents[eventKey];
        const configuredEvent = request.model.events[eventKey];

        assert(configuredEvent.active, `${eventKey} should be active by default`);
        assert.strictEqual(
            configuredEvent.event,
            SERVICE.DefaultWorkflowEventService.createEventName('order', 'approval', expected.event),
            `${eventKey} should be materialized into a schema/workflow-specific event name`
        );
        assert.strictEqual(
            configuredEvent.listener,
            defaultWorkflowConfig.events[eventKey].listener,
            `${eventKey} should keep its configured listener`
        );

        const pipeline = pipelines[expected.pipeline];
        assert(pipeline, `${expected.pipeline} should be registered`);
        assert.strictEqual(pipeline.startNode, 'validateRequest', `${expected.pipeline} should validate first`);
        assert.strictEqual(pipeline.nodes.prepareProcess.type, 'process', `${expected.pipeline} should use the shared workflow prepare process`);
        assert.strictEqual(pipeline.nodes.prepareProcess.handler, 'defaultWorkflowProcessPreparePipeline', `${expected.pipeline} should prepare schema/search context before mutation`);
        assert.strictEqual(pipeline.nodes.prepareModels.success.schemaOperation, 'updateSchemaItems', `${expected.pipeline} should expose the schema update hook`);
        assert.strictEqual(pipeline.nodes.prepareModels.success.searchOperation, 'updateSearchItems', `${expected.pipeline} should expose the search update hook`);
    });

    for (const eventKey of Object.keys(lifecycleEvents)) {
        const expected = lifecycleEvents[eventKey];
        const listener = require(expected.listenerModule);
        const event = {
            tenant: 'default',
            data: {
                carrier: {
                    code: `carrier-${eventKey}`,
                    sourceDetail: {
                        schemaName: 'order'
                    }
                }
            }
        };

        const result = await invokeListener(listener, expected.listenerMethod, event);
        const call = pipelineCalls[pipelineCalls.length - 1];

        assert.strictEqual(result.code, 'SUC_EVNT_00000', `${eventKey} listener should return event success`);
        assert.strictEqual(call.pipelineName, expected.pipeline, `${eventKey} listener should dispatch the lifecycle pipeline`);
        assert.strictEqual(call.request.tenant, 'default', `${eventKey} listener should pass tenant to pipeline`);
        assert.strictEqual(call.request.event, event, `${eventKey} listener should pass original event to pipeline`);
        assert.strictEqual(call.request.data, event.data, `${eventKey} listener should pass event data to pipeline`);
    }

    console.log('NBPM workflow lifecycle pipeline contract validated: events, interceptors, listeners, move pipelines');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
