/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/workflow/flowCore/test/workflowActionPerformEngineContract.test
 * @description Validates deterministic workflow action engine behavior for state transitions, action responses, channel splitting, carrier persistence, and channel traversal.
 * @layer test
 * @owner workflow
 * @override Project modules may add workflow engine coverage in their own module tests while preserving this base workflow contract.
 */

const assert = require('assert');

global.ENUMS = {
    WorkflowActionType: {
        MANUAL: { key: 'MANUAL' },
        AUTO: { key: 'AUTO' },
        PARALLEL: { key: 'PARALLEL' }
    },
    WorkflowActionPosition: {
        HEAD: { key: 'HEAD' },
        ACTION: { key: 'ACTION' },
        END: { key: 'END' }
    },
    WorkflowActionResponseType: {
        SUCCESS: { key: 'SUCCESS' },
        REJECTED: { key: 'REJECTED' },
        ERROR: { key: 'ERROR' }
    },
    WorkflowActionState: {
        PROCESSING: { key: 'PROCESSING' },
        FINISHED: { key: 'FINISHED' },
        ERROR: { key: 'ERROR' }
    },
    WorkflowCarrierState: {
        INIT: { key: 'INIT' },
        RELEASED: { key: 'RELEASED' },
        PROCESSING: { key: 'PROCESSING' },
        SPLITTED: { key: 'SPLITTED' },
        PAUSED: { key: 'PAUSED' },
        BLOCKED: { key: 'BLOCKED' },
        FINISHED: { key: 'FINISHED' },
        ERROR: { key: 'ERROR' },
        FATAL: { key: 'FATAL' }
    }
};

global.UTILS = {
    isBlank: function (value) {
        return value === undefined || value === null || value === '' || (typeof value === 'object' && Object.keys(value).length === 0);
    }
};

class NodicsError extends Error {
    toJson() {
        return {
            message: this.message
        };
    }
}

class WorkflowError extends NodicsError {
    constructor(code, message) {
        super(message || code);
        this.code = message ? code : undefined;
    }

    toJson() {
        return {
            code: this.code,
            message: this.message
        };
    }
}

const pipelineCalls = [];
const actionResponses = [];
const carrierSaves = [];

global.CLASSES = {
    NodicsError,
    WorkflowError
};

global.SERVICE = {
    DefaultWorkflowUtilsService: {
        isProcessingAllowed: function (workflowCarrier) {
            return ['RELEASED', 'PROCESSING', 'ERROR'].includes(workflowCarrier.currentState.state);
        }
    },
    DefaultPipelineService: {
        start: function (pipelineName, request, response) {
            pipelineCalls.push({ pipelineName, request, response });
            if (pipelineName === 'evaluateChannelsPipeline') {
                return Promise.resolve({
                    qualifiedChannels: request.actionResponse.qualifiedChannels || [],
                    messages: ['channels evaluated']
                });
            }
            if (pipelineName === 'prepareChannelRequestsPipeline') {
                return Promise.resolve({
                    channelRequests: request.actionResponse.channelRequests || [],
                    messages: ['channel requests prepared']
                });
            }
            if (pipelineName === 'nextWorkflowActionPipeline' && request.actionCode === 'failAction') {
                return Promise.reject(new Error('next action failed'));
            }
            if (pipelineName === 'nextWorkflowActionPipeline') {
                return Promise.resolve({
                    messages: [`next ${request.actionCode}`],
                    workflowCarrier: request.workflowCarrier,
                    [request.actionCode]: { processed: true }
                });
            }
            return Promise.resolve({});
        }
    },
    DefaultActionResponseService: {
        save: function (request) {
            actionResponses.push(request);
            return Promise.resolve({
                result: Object.assign({ _id: `response-${actionResponses.length}` }, request.model)
            });
        }
    },
    DefaultWorkflowCarrierService: {
        save: function (request) {
            carrierSaves.push(request);
            return Promise.resolve({
                result: Object.assign({ persisted: true }, request.model)
            });
        }
    }
};

const workflowActionEngine = require('../src/service/procs/execute/defaultWorkflowActionPerformPipelineService');
workflowActionEngine.LOG = {
    debug: function () { }
};

function createProcess() {
    return {
        nextCount: 0,
        stopCount: 0,
        errorValue: undefined,
        stopValue: undefined,
        nextSuccess: function () {
            this.nextCount++;
        },
        stop: function (request, response, value) {
            this.stopCount++;
            this.stopValue = value || response.success;
        },
        error: function (request, response, error) {
            this.errorValue = error;
        }
    };
}

function createResponse() {
    return {
        success: {
            messages: []
        }
    };
}

function createRequest(overrides = {}) {
    return Object.assign({
        tenant: 'testTenant',
        authData: { user: 'tester' },
        workflowHead: { code: 'approvalHead' },
        workflowAction: {
            code: 'approve',
            type: 'MANUAL',
            position: 'ACTION',
            allowedDecisions: ['approve', 'reject']
        },
        actionResponse: {
            decision: 'approve',
            feedback: {
                message: 'approved'
            }
        },
        workflowCarrier: {
            code: 'carrier-1',
            activeHead: 'approvalHead',
            activeAction: {
                code: 'approve',
                type: 'MANUAL',
                state: 'RELEASED'
            },
            currentState: {
                state: 'RELEASED',
                action: 'approve',
                description: 'released',
                time: new Date()
            },
            states: [],
            actions: []
        }
    }, overrides);
}

function resetCalls() {
    pipelineCalls.length = 0;
    actionResponses.length = 0;
    carrierSaves.length = 0;
}

async function runAsyncStep(stepName, request, response) {
    const process = createProcess();
    workflowActionEngine[stepName](request, response, process);
    await new Promise((resolve) => setImmediate(resolve));
    return process;
}

(async function run() {
    resetCalls();

    let request = createRequest();
    let response = createResponse();
    let process = createProcess();
    workflowActionEngine.validateOperation(request, response, process);
    assert.strictEqual(process.nextCount, 1, 'released manual carrier should be eligible for action processing');

    request = createRequest({
        workflowCarrier: Object.assign(createRequest().workflowCarrier, {
            currentState: {
                state: 'PAUSED',
                action: 'approve',
                description: 'paused',
                time: new Date()
            }
        })
    });
    process = createProcess();
    workflowActionEngine.validateOperation(request, response, process);
    assert(process.errorValue, 'paused carrier should not be processed');

    request = createRequest({
        workflowCarrier: Object.assign(createRequest().workflowCarrier, {
            currentState: {
                state: 'BLOCKED',
                action: 'approve',
                description: 'blocked',
                time: new Date()
            }
        })
    });
    process = createProcess();
    workflowActionEngine.validateOperation(request, response, process);
    assert(process.errorValue, 'blocked carrier should not be processed');

    request = createRequest();
    response = createResponse();
    process = createProcess();
    workflowActionEngine.preUpdateCarrier(request, response, process);
    assert.strictEqual(request.workflowCarrier.currentState.state, 'PROCESSING', 'pre-update should move carrier to processing');
    assert.strictEqual(request.workflowCarrier.activeAction.state, 'PROCESSING', 'pre-update should mark active action processing');
    assert.strictEqual(request.workflowCarrier.states.length, 1, 'pre-update should append a processing state');
    assert.strictEqual(process.nextCount, 1, 'pre-update should continue pipeline');

    response = createResponse();
    workflowActionEngine.createStepResponse(request, response, createProcess());
    assert.strictEqual(response.success.approve.workflowCode, 'approvalHead', 'step response should include workflow code');
    assert.strictEqual(response.success.approve.actionCode, 'approve', 'step response should include action code');
    assert.strictEqual(response.success.approve.carrierCode, 'carrier-1', 'step response should include carrier code');
    assert.strictEqual(response.success.approve.type, 'SUCCESS', 'step response should default to success');

    process = createProcess();
    workflowActionEngine.validateActionResponse(request, response, process);
    assert.strictEqual(process.nextCount, 1, 'allowed decision should continue pipeline');

    workflowActionEngine.updatePostCarrierState(request, response, createProcess());
    assert.strictEqual(request.workflowCarrier.activeAction.state, 'FINISHED', 'successful response should finish active action');
    assert.strictEqual(request.workflowCarrier.activeAction.actionResponse.decision, 'approve', 'active action should keep its response snapshot');

    response.success.approve.qualifiedChannels = [
        { code: 'approveToFulfill', target: 'fulfill' },
        { code: 'approveToNotify', target: 'notify' }
    ];
    process = await runAsyncStep('evaluateChannels', request, response);
    assert.strictEqual(process.nextCount, 1, 'channel evaluation should continue pipeline');
    assert.strictEqual(request.workflowCarrier.currentState.state, 'SPLITTED', 'multiple channels should mark carrier split');
    assert.deepStrictEqual(response.success.approve.qualifiedChannels.map(channel => channel.code), ['approveToFulfill', 'approveToNotify'], 'qualified channels should be retained on action response');

    response.success.approve.channelRequests = [
        {
            channel: { code: 'approveToFulfill', target: 'fulfill' },
            workflowCarrier: { code: 'carrier-1-fulfill' }
        },
        {
            channel: { code: 'approveToNotify', target: 'failAction' },
            workflowCarrier: { code: 'carrier-1-notify' }
        }
    ];
    process = await runAsyncStep('prepareChannelRequests', request, response);
    assert.strictEqual(process.nextCount, 1, 'channel request preparation should continue pipeline');
    assert.strictEqual(response.channelRequests.length, 2, 'prepared channel requests should be exposed to later pipeline steps');

    process = await runAsyncStep('updateActionResponse', request, response);
    assert.strictEqual(process.nextCount, 1, 'action response save should continue pipeline');
    assert.strictEqual(actionResponses.length, 1, 'action response should be saved once');
    assert.strictEqual(response.success.approve._id, 'response-1', 'saved action response id should be retained');

    process = await runAsyncStep('updateWorkflowCarrier', request, response);
    assert.strictEqual(process.nextCount, 1, 'non-terminal split carrier should continue to channel execution');
    assert.strictEqual(carrierSaves.length, 1, 'workflow carrier should be saved once');
    assert.deepStrictEqual(request.workflowCarrier.subCarriers, ['carrier-1-fulfill', 'carrier-1-notify'], 'split carrier should record sub-carrier codes');
    assert.strictEqual(request.workflowCarrier.actions[0].responseId, 'response-1', 'carrier action history should reference saved action response');

    process = await runAsyncStep('executeChannels', request, response);
    assert.strictEqual(process.nextCount, 1, 'channel execution should continue even when one branch fails');
    assert.strictEqual(response.success.fulfill.processed, true, 'successful channel should merge next action result');
    assert(response.success.approveToNotify.message.includes('next action failed'), 'failed channel should be captured under channel code');
    assert.deepStrictEqual(
        pipelineCalls.filter(call => call.pipelineName === 'nextWorkflowActionPipeline').map(call => call.request.actionCode),
        ['fulfill', 'failAction'],
        'channel traversal should dispatch next actions in order'
    );

    request = createRequest({
        workflowAction: {
            code: 'endAction',
            type: 'MANUAL',
            position: 'END',
            allowedDecisions: ['done']
        },
        actionResponse: {
            decision: 'done',
            feedback: {
                message: 'done'
            }
        },
        workflowCarrier: Object.assign(createRequest().workflowCarrier, {
            activeAction: {
                code: 'endAction',
                type: 'MANUAL',
                state: 'RELEASED'
            }
        })
    });
    response = createResponse();
    workflowActionEngine.createStepResponse(request, response, createProcess());
    response.success.endAction.qualifiedChannels = [];
    process = createProcess();
    workflowActionEngine.validateEndAction(request, response, process);
    assert.strictEqual(request.workflowCarrier.currentState.state, 'FINISHED', 'terminal end action should finish carrier when no channels qualify');

    process = await runAsyncStep('updateWorkflowCarrier', request, response);
    assert.strictEqual(process.stopCount, 1, 'terminal carrier update should stop pipeline');
    assert.strictEqual(process.nextCount, 0, 'terminal carrier update should not continue to channel execution');

    console.log('Workflow action perform engine contract validated: state, response, split, traversal, terminal paths');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
