/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/workflow/flowCore/test/workflowEngineCorrectnessContract.test
 * @description Validates low-level workflow engine correctness for script channel qualification, carrier event updates, and internal workflow event naming.
 * @layer test
 * @owner workflow
 * @override Project modules may add workflow correctness tests in their own module boundaries while preserving this application workflow contract.
 */

const assert = require('assert');

if (!String.prototype.toUpperCaseFirstChar) {
    String.prototype.toUpperCaseFirstChar = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };
}

global.ENUMS = {
    WorkflowCarrierType: {
        FIXED: { key: 'FIXED' },
        FLEXI: { key: 'FLEXI' }
    },
    WorkflowCarrierState: {
        INIT: { key: 'INIT' },
        RELEASED: { key: 'RELEASED' }
    },
    TargetType: {
        MODULE: { key: 'MODULE' },
        EXTERNAL: { key: 'EXTERNAL' }
    }
};

global.CONFIG = {
    get: function (key) {
        if (key === 'nodeId') return 'workflowNode';
        return {};
    }
};

class WorkflowError extends Error {
    constructor(code, message) {
        super(message || String(code));
        this.code = message ? code : undefined;
    }
}

global.CLASSES = {
    WorkflowError
};

const publishedEvents = [];

global.SERVICE = {
    DefaultEventService: {
        publish: function (event) {
            publishedEvents.push(event);
            return Promise.resolve({ result: event });
        }
    }
};

const qualifierService = require('../src/service/procs/evaluate/defaultExecuteChannelQualifierPipelineService');
const carrierUpdateService = require('../src/service/procs/update/defaultWorkflowCarrierUpdatePipelineService');
const workflowEventService = require('../src/service/events/defaultWorkflowEventService');

qualifierService.LOG = {
    debug: function () { },
    error: function () { }
};
carrierUpdateService.LOG = {
    debug: function () { }
};

function createProcess() {
    return {
        stopValue: undefined,
        errorValue: undefined,
        nextCount: 0,
        stop: function (request, response, value) {
            this.stopValue = value;
        },
        error: function (request, response, error) {
            this.errorValue = error;
        },
        nextSuccess: function () {
            this.nextCount++;
        }
    };
}

(async function run() {
    let process = createProcess();
    qualifierService.executeScript({
        tenant: 'testTenant',
        authData: { user: 'tester' },
        actionResponse: {
            decision: 'APPROVE'
        },
        channel: {
            qualifier: {
                script: "request.actionResponse.decision === 'APPROVE'"
            }
        }
    }, {}, process);

    assert.strictEqual(process.stopValue, true, 'channel qualifier script should evaluate with access to the request context');
    assert.strictEqual(process.errorValue, undefined, 'channel qualifier script should not fail because of request shadowing');

    const workflowCarrier = {
        code: 'carrier-1',
        type: 'FLEXI',
        currentState: { state: 'INIT' },
        event: {
            enabled: false
        },
        items: [
            { code: 'existing', quantity: 1 }
        ]
    };
    process = createProcess();
    const updateRequest = {
        workflowCarrier,
        workflowHead: {
            isNewItemsAllowed: true
        },
        event: {
            enabled: true,
            isInternal: true
        },
        items: [
            { code: 'existing', quantity: 2 },
            { code: 'newItem', quantity: 1 }
        ]
    };

    carrierUpdateService.prepareUpdates(updateRequest, { success: { messages: [] } }, process);

    assert.strictEqual(process.nextCount, 1, 'carrier update preparation should continue after applying event and item changes');
    assert.strictEqual(updateRequest.carrierUpdated, true, 'carrier should be marked updated when event or item changes exist');
    assert.deepStrictEqual(workflowCarrier.event, updateRequest.event, 'request event should be propagated to the carrier');
    assert.deepStrictEqual(workflowCarrier.items.map(item => item.code), ['existing', 'newItem'], 'carrier item updates should merge existing and new items');
    assert.strictEqual(workflowCarrier.items[0].quantity, 2, 'existing item should be updated from request data');

    assert.strictEqual(
        workflowEventService.createEventName('contact', 'approvalFlow', 'initiated'),
        'contactApprovalFlowInitiated',
        'workflow event names should combine source, workflow, and event suffix consistently'
    );

    publishedEvents.length = 0;
    const event = {
        event: 'initiated',
        data: {
            carrier: {}
        }
    };
    await workflowEventService.publishInternalEvent(event, {
        code: 'carrier-2',
        activeHead: 'approvalFlow',
        activeAction: {
            code: 'approve'
        },
        sourceDetail: {
            schemaName: 'contact',
            moduleName: 'profile'
        }
    });

    assert.strictEqual(publishedEvents.length, 1, 'internal workflow event should be published once');
    assert.strictEqual(publishedEvents[0].event, 'contactApprovalFlowInitiated', 'internal workflow event should use generated event name');
    assert.strictEqual(publishedEvents[0].target, 'profile', 'internal workflow event should target the source module');
    assert.strictEqual(publishedEvents[0].targetType, 'MODULE', 'internal workflow event should target a Nodics module');

    console.log('Workflow engine correctness contract validated: script qualifier, carrier event update, internal event naming');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
