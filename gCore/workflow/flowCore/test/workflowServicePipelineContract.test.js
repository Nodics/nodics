/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

const calls = [];

global.SERVICE = {
    DefaultPipelineService: {
        start: function (pipelineName, request, response) {
            calls.push({ pipelineName, request, response });
            return Promise.resolve({ pipelineName, request, response });
        }
    }
};

global.CLASSES = {
    WorkflowError: class WorkflowError extends Error {
        constructor(code, message) {
            super(message || code);
            this.code = message ? code : undefined;
        }
    }
};

const workflowService = require('../src/service/workflow/defaultWorkflowService');

async function assertPipelineDispatch(operation, expectedPipeline, expectedWrappedResponse) {
    calls.length = 0;
    const request = { carrierCode: `${operation}Carrier` };
    const result = await workflowService[operation](request);

    assert.strictEqual(calls.length, 1, `${operation} should dispatch one pipeline`);
    assert.strictEqual(calls[0].pipelineName, expectedPipeline, `${operation} should use ${expectedPipeline}`);
    assert.strictEqual(calls[0].request, request, `${operation} should pass the original request`);
    assert.deepStrictEqual(calls[0].response, {}, `${operation} should start with an empty pipeline response`);

    if (expectedWrappedResponse) {
        assert.strictEqual(result.code, 'SUC_WF_00000', `${operation} should return workflow success code`);
        assert.strictEqual(result.result.pipelineName, expectedPipeline, `${operation} should wrap pipeline result`);
    } else {
        assert.strictEqual(result.pipelineName, expectedPipeline, `${operation} should return pipeline result`);
    }
}

(async function run() {
    await assertPipelineDispatch('initCarrier', 'initWorkflowCarrierPipeline', true);
    await assertPipelineDispatch('releaseCarrier', 'releaseWorkflowCarrierPipeline', true);
    await assertPipelineDispatch('updateCarrier', 'updateWorkflowCarrierPipeline', true);
    await assertPipelineDispatch('performAction', 'performWorkflowActionPipeline', true);
    await assertPipelineDispatch('nextAction', 'nextWorkflowActionPipeline', false);

    ['retryCarrier', 'recoverCarrier', 'resetErrorCarrier', 'pauseCarrier', 'blockCarrier', 'resumeCarrier'].forEach((operation) => {
        assert.strictEqual(workflowService[operation], undefined, `${operation} must not be exposed by DefaultWorkflowService until governed lifecycle contracts exist`);
    });

    console.log('Workflow service pipeline contract validated: 5 operations');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
