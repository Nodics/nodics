/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
    WorkflowCarrierType: {
        FIXED: { key: 'FIXED' },
        FLEXI: { key: 'FLEXI' }
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

const schemas = require('../src/schemas/schemas').workflow;

const generatedCrudSchemas = [
    'workflowAction',
    'workflowChannel',
    'actionResponse',
    'workflowCarrier',
    'workflowItem',
    'workflowArchivedCarrier',
    'workflowErrorCarrier',
    'workflowArchivedItem'
];

generatedCrudSchemas.forEach((schemaName) => {
    assert(schemas[schemaName], `Expected workflow schema ${schemaName}`);
    assert.strictEqual(schemas[schemaName].model && schemas[schemaName].model, true, `${schemaName} should generate a model`);
    assert.strictEqual(schemas[schemaName].service && schemas[schemaName].service.enabled, true, `${schemaName} should generate a service`);
    assert.strictEqual(schemas[schemaName].router && schemas[schemaName].router.enabled, true, `${schemaName} should generate CRUD/API routes`);
});

[
    'initCarrier',
    'releaseCarrier',
    'updateCarrier',
    'performAction',
    'retryCarrier',
    'recoverCarrier',
    'resetErrorCarrier',
    'pauseCarrier',
    'blockCarrier',
    'resumeCarrier'
].forEach((operation) => {
    generatedCrudSchemas.forEach((schemaName) => {
        assert.notStrictEqual(schemas[schemaName].router.operation, operation, `${schemaName} generated CRUD route must not own workflow orchestration operation ${operation}`);
    });
});

assert.strictEqual(schemas.workflow.model, false, 'workflow base schema should not generate a model');
assert.strictEqual(schemas.workflow.router.enabled, false, 'workflow base schema should not generate CRUD/API routes');
assert.strictEqual(schemas.workflowCarrier.refSchema.items.schemaName, 'workflowItem', 'workflowCarrier should own workflowItem references');
assert.strictEqual(schemas.workflowArchivedCarrier.refSchema.items.schemaName, 'workflowArchivedItem', 'workflowArchivedCarrier should own archived item references');

console.log(`Workflow schema router contract validated: ${generatedCrudSchemas.length} generated CRUD schemas`);
