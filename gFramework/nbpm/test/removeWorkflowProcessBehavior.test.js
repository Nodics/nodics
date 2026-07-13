/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

// @nodics-capability-behavior @nodics-area workflow
const errorLogs = [];
const debugLogs = [];
let publishedEvent = null;

global.UTILS = {
    isBlank: function (value) {
        return value === undefined || value === null || value === '' ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'object' && Object.keys(value).length === 0);
    }
};

global.CONFIG = {
    get: function (key) {
        return key === 'nodeId' ? 'testNode' : undefined;
    }
};

global.ENUMS = {
    TargetType: {
        MODULE: {
            key: 'MODULE'
        }
    }
};

global.SERVICE = {
    DefaultWorkflowEventService: {
        publishWorkflowEvent: function (event, schemaModel, models) {
            publishedEvent = {
                event,
                schemaName: schemaModel.schemaName,
                models
            };
            return Promise.resolve(true);
        }
    }
};

const service = require('../src/service/procs/database/remove/defaultModelsRemoveInitializerService');
service.LOG = {
    debug: function (message) {
        debugLogs.push(message);
    },
    error: function (message, error) {
        errorLogs.push({ message, error });
    }
};

function createProcessProbe() {
    let probe = {
        nextSuccessCalled: false,
        errorCalled: false
    };
    probe.process = {
        nextSuccess: function () {
            probe.nextSuccessCalled = true;
        },
        error: function () {
            probe.errorCalled = true;
        }
    };
    return probe;
}

function createRequest() {
    return {
        tenant: 'default',
        schemaModel: {
            moduleName: 'profile',
            schemaName: 'contact',
            workflows: {
                contactWorkflow: {
                    workflowCode: 'contactWorkflow'
                }
            }
        }
    };
}

let noModelsProbe = createProcessProbe();
service.handleWorkflowProcess(createRequest(), {
    success: {
        result: {
            n: 1
        }
    }
}, noModelsProbe.process);

assert.strictEqual(noModelsProbe.nextSuccessCalled, true);
assert.strictEqual(noModelsProbe.errorCalled, false);
assert.strictEqual(errorLogs.length, 0);
assert.strictEqual(publishedEvent, null);

let nonWorkflowProbe = createProcessProbe();
service.handleWorkflowProcess(createRequest(), {
    success: {
        result: {
            n: 1,
            models: [{
                code: 'contactOne'
            }]
        }
    }
}, nonWorkflowProbe.process);

assert.strictEqual(nonWorkflowProbe.nextSuccessCalled, true);
assert.strictEqual(nonWorkflowProbe.errorCalled, false);
assert.strictEqual(errorLogs.length, 0);
assert.strictEqual(publishedEvent, null);
assert(debugLogs.some(message => message.includes('not workflow compatible')));

let workflowProbe = createProcessProbe();
service.handleWorkflowProcess(createRequest(), {
    success: {
        result: {
            n: 1,
            models: [{
                code: 'contactTwo',
                workflow: {
                    code: 'contactWorkflow'
                }
            }]
        }
    }
}, workflowProbe.process);

assert.strictEqual(workflowProbe.nextSuccessCalled, true);
assert.strictEqual(workflowProbe.errorCalled, false);
assert.strictEqual(errorLogs.length, 0);
assert.strictEqual(publishedEvent.event.event, 'initiateWorkflow');
assert.strictEqual(publishedEvent.event.tenant, 'default');
assert.strictEqual(publishedEvent.schemaName, 'contact');
assert.deepStrictEqual(publishedEvent.models.map(model => model.code), ['contactTwo']);

console.log('BPM remove workflow process behavior validated');
