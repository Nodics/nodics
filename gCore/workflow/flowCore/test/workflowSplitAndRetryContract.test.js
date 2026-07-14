/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/workflow/flowCore/test/workflowSplitAndRetryContract.test
 * @description Validates workflow split channel request preparation and carrier retry/error guard behavior.
 * @layer test
 * @owner workflow
 * @override Project modules may add workflow split or retry behavior tests in their own module boundaries while preserving this base workflow contract.
 */

const assert = require('assert');

global.ENUMS = {
    WorkflowCarrierState: {
        INIT: { key: 'INIT' }
    }
};

global.CONFIG = {
    get: function (key) {
        if (key === 'workflow') {
            return {
                defaultSplitEndChannel: 'defaultSplitEndChannel',
                itemErrorLimit: 3
            };
        }
        return {};
    }
};

class WorkflowError extends Error {
    constructor(code, message) {
        super(message || code);
        this.code = message ? code : undefined;
    }
}

global.CLASSES = {
    WorkflowError
};

const channelLookups = [];
let carrierLookupResult = [];

global.SERVICE = {
    DefaultWorkflowChannelService: {
        get: function (request) {
            channelLookups.push(request);
            if (request.query.code === 'missingSplitEndChannel') {
                return Promise.resolve({ result: [] });
            }
            return Promise.resolve({
                result: [
                    {
                        code: request.query.code,
                        target: 'splitEndAction',
                        qualifier: {
                            decision: 'SPLIT_END'
                        }
                    }
                ]
            });
        }
    }
};

const prepareChannelRequestsService = require('../src/service/procs/prepare/defaultPrepareChannelRequestsPipelineService');
const workflowCarrierService = require('../src/service/carrier/defaultWorkflowCarrierService');

prepareChannelRequestsService.LOG = {
    debug: function () { }
};
workflowCarrierService.LOG = {
    debug: function () { }
};
workflowCarrierService.get = function () {
    return Promise.resolve({ result: carrierLookupResult });
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

async function runAsyncStep(service, stepName, request, response) {
    const process = createProcess();
    service[stepName](request, response, process);
    await new Promise((resolve) => setImmediate(resolve));
    return process;
}

function createSplitRequest() {
    return {
        tenant: 'testTenant',
        authData: { user: 'tester' },
        workflowHead: { code: 'approvalHead' },
        workflowAction: { code: 'approve' },
        actionResponse: {
            qualifiedChannels: [
                { code: 'approveToFulfill', target: 'fulfillAction' },
                { code: 'approveToNotify', target: 'notifyAction' }
            ]
        },
        workflowCarrier: {
            _id: 'carrier-db-id',
            code: 'carrier-1',
            actions: [
                { code: 'approve' }
            ],
            items: [
                { _id: 'item-1-db-id', code: 'item-1', refId: 'source-1' },
                { _id: 'item-2-db-id', code: 'item-2', refId: 'source-2' }
            ]
        }
    };
}

(async function run() {
    channelLookups.length = 0;
    let request = createSplitRequest();
    let response = { success: { messages: [] } };

    let process = await runAsyncStep(prepareChannelRequestsService, 'finalizeChannels', request, response);

    assert.strictEqual(process.nextCount, 1, 'split finalization should continue when default split-end channel exists');
    assert.strictEqual(response.defaultSplitEndChannel.code, 'defaultSplitEndChannel', 'split finalization should load configured default split-end channel');
    assert.strictEqual(channelLookups[0].query.code, 'defaultSplitEndChannel', 'split finalization should query the configured default split-end channel');

    process = createProcess();
    prepareChannelRequestsService.prepareChannelsRequest(request, response, process);

    assert.strictEqual(process.nextCount, 1, 'split channel request preparation should continue');
    assert.strictEqual(response.success.channelRequests.length, 3, 'split workflow should create one parent continuation plus one request per branch');
    assert.strictEqual(response.success.channelRequests[0].workflowCarrier.code, 'carrier-1', 'first request should keep parent carrier');
    assert.strictEqual(response.success.channelRequests[0].channel.code, 'defaultSplitEndChannel', 'parent request should use default split-end channel');
    assert.deepStrictEqual(
        response.success.channelRequests.slice(1).map(channelRequest => channelRequest.workflowCarrier.code),
        ['carrier-1_0', 'carrier-1_1'],
        'branch carriers should derive deterministic codes from the parent'
    );
    assert.deepStrictEqual(
        response.success.channelRequests[1].workflowCarrier.items.map(item => item.code),
        ['item-1_0_0', 'item-2_0_1'],
        'branch carrier items should derive deterministic branch item codes'
    );
    assert.strictEqual(response.success.channelRequests[1].workflowCarrier.items[0].originalCode, 'item-1', 'branch item should preserve original code');
    assert.strictEqual(response.success.channelRequests[1].workflowCarrier.items[0]._id, undefined, 'branch item should not retain source database id');
    assert.strictEqual(response.success.channelRequests[1].workflowCarrier.originalCode, 'carrier-1', 'branch carrier should preserve original parent code');

    const originalGet = SERVICE.DefaultWorkflowChannelService.get;
    SERVICE.DefaultWorkflowChannelService.get = function () {
        return Promise.resolve({ result: [] });
    };
    request = createSplitRequest();
    response = { success: { messages: [] } };
    process = await runAsyncStep(prepareChannelRequestsService, 'finalizeChannels', request, response);
    assert.strictEqual(process.nextCount, 0, 'split finalization should not continue when default split-end channel is missing');
    assert.strictEqual(process.errorValue, 'Invalid channel, Default split channel not found', 'missing split-end channel should fail closed');
    SERVICE.DefaultWorkflowChannelService.get = originalGet;

    carrierLookupResult = [
        {
            code: 'carrier-retry-open',
            active: true,
            errorCount: 2
        }
    ];
    const availableCarrier = await workflowCarrierService.getWorkflowCarrier({
        tenant: 'testTenant',
        carrierCode: 'carrier-retry-open'
    });
    assert.strictEqual(availableCarrier.code, 'carrier-retry-open', 'carrier below error limit should be returned');

    carrierLookupResult = [
        {
            code: 'carrier-error-limit',
            active: true,
            errorCount: 3
        }
    ];
    await assert.rejects(
        () => workflowCarrierService.getWorkflowCarrier({
            tenant: 'testTenant',
            carrierCode: 'carrier-error-limit'
        }),
        (error) => error.code === 'ERR_WF_00003' && error.message.includes('error limit'),
        'carrier at configured error limit should require manual intervention'
    );

    carrierLookupResult = [
        {
            code: 'carrier-inactive',
            active: false,
            errorCount: 0
        }
    ];
    await assert.rejects(
        () => workflowCarrierService.getWorkflowCarrier({
            tenant: 'testTenant',
            carrierCode: 'carrier-inactive'
        }),
        (error) => error.code === 'ERR_WF_00011' && error.message.includes('de-activated'),
        'inactive carrier should be rejected unless inactive loading is explicitly requested'
    );

    const inactiveCarrier = await workflowCarrierService.getWorkflowCarrier({
        tenant: 'testTenant',
        carrierCode: 'carrier-inactive',
        loadInActive: true
    });
    assert.strictEqual(inactiveCarrier.code, 'carrier-inactive', 'inactive carrier should load when request explicitly allows it');

    console.log('Workflow split and retry contract validated: split-end channel, branch cloning, carrier guards');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
