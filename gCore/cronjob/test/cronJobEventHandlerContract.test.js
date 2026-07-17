/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/cronjob/test/cronJobEventHandlerContract.test
 * @description Validates cronjob event-handler jobs build internal NEMS requests, update execution state, and persist optional job logs.
 * @layer test
 * @owner cronjob
 * @override Project modules may add event-job variants while preserving this NEMS processing and log contract.
 */

const assert = require('assert');

const buildRequests = [];
const fetchRequests = [];
const savedJobs = [];
const savedLogs = [];
const logger = {
    debug: function () {},
    info: function () {},
    warn: function () {},
    error: function () {}
};

global.CONFIG = {
    get: function (key) {
        if (key === 'nodeId') {
            return 'nodeA';
        }
        if (key === 'nemsModuleName') {
            return 'nems';
        }
        return undefined;
    }
};

global.ENUMS = {
    CronJobStatus: {
        SUCCESS: { key: 'SUCCESS' },
        ERROR: { key: 'ERROR' }
    },
    CronJobState: {
        FINISHED: { key: 'FINISHED' }
    }
};

global.CLASSES = {
    NodicsError: class NodicsError extends Error {
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
};

global.NODICS = {
    getInternalAuthToken: function (tenant) {
        return 'token-' + tenant;
    }
};

let shouldFetchFail = false;

global.SERVICE = {
    DefaultModuleService: {
        buildRequest: function (request) {
            buildRequests.push(request);
            return Object.assign({ built: true }, request);
        },
        fetch: function (request) {
            fetchRequests.push(request);
            if (shouldFetchFail) {
                return Promise.reject(new Error('nems failed'));
            }
            return Promise.resolve({
                code: 'SUC_NEMS_00000',
                result: ['processed']
            });
        }
    },
    DefaultCronJobService: {
        save: function (request) {
            savedJobs.push(request);
            return Promise.resolve({ result: request.model });
        }
    },
    DefaultCronJobLogService: {
        save: function (request) {
            savedLogs.push(request);
            return Promise.resolve({ result: request.model });
        }
    }
};

const eventHandlerJobService = require('../src/service/event/defaultEventHandlerJobService');
eventHandlerJobService.LOG = logger;

(async function run() {
    let definition = {
        code: 'eventProcessor',
        tenant: 'tenantA',
        targetNodeId: 'nodeB',
        logResult: true
    };

    let url = eventHandlerJobService.prepareURL(definition);
    assert.strictEqual(url.connectionType, 'node', 'target node should force node connection');
    assert.strictEqual(url.nodeId, 'nodeB', 'target node should be used in module request');
    assert.strictEqual(url.moduleName, 'nems', 'event handler should call the configured NEMS module');
    assert.strictEqual(url.apiName, '/event/process', 'event handler should target event processing API');
    assert.strictEqual(url.header.Authorization, 'Bearer token-tenantA', 'event handler should use tenant internal auth token');

    let success = await eventHandlerJobService.triggerEventHandlerJob(definition, {});
    assert.strictEqual(success.code, 'SUC_JOB_00000', 'successful NEMS processing should resolve as job success envelope');
    assert.strictEqual(definition.lastResult, 'SUCCESS', 'successful NEMS processing should mark last result success');
    assert.strictEqual(definition.state, 'FINISHED', 'successful NEMS processing should finish the job');
    assert.strictEqual(savedLogs.length, 1, 'successful NEMS processing should save a log when enabled');
    assert.strictEqual(savedJobs[0].model.code, 'eventProcessor', 'successful NEMS processing should persist job state');

    shouldFetchFail = true;
    definition = {
        code: 'eventProcessorFailure',
        tenant: 'tenantA',
        logResult: true
    };

    success = await eventHandlerJobService.triggerEventHandlerJob(definition, {});
    assert.strictEqual(success.code, 'SUC_JOB_00000', 'failed NEMS processing should still resolve after recording job error');
    assert.strictEqual(definition.lastResult, 'ERROR', 'failed NEMS processing should mark last result error');
    assert.strictEqual(definition.state, 'FINISHED', 'failed NEMS processing should finish the job');
    assert.strictEqual(savedLogs.length, 2, 'failed NEMS processing should save an error log when enabled');
    assert.strictEqual(fetchRequests[1].connectionType, 'abstract', 'missing target node should use abstract module connection');

    console.log('CronJob event handler contract validated: NEMS request, state update, logs');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
