/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/cronjob/test/cronJobRuntimeContainerContract.test
 * @description Validates cronjob all-job startup, node ownership, temporary failover ownership, and runtime container lifecycle behavior.
 * @layer test
 * @owner cronjob
 * @override Project modules may add scheduler integration tests while preserving this deterministic container contract.
 */

const assert = require('assert');

const updateCalls = [];
const fakeJobs = [];
const logger = {
    debug: function () {},
    info: function () {},
    warn: function () {},
    error: function () {}
};

global.UTILS = {
    isBlank: function (value) {
        return value === undefined || value === null || value === '' ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'object' && Object.keys(value).length === 0);
    }
};

global.CONFIG = {
    get: function (key) {
        if (key === 'nodeId') {
            return 'nodeA';
        }
        return undefined;
    }
};

global.ENUMS = {
    CronJobState: {
        CREATED: { key: 'CREATED' }
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

class CronJobError extends NodicsError {}

function FakeCronJob(definition) {
    fakeJobs.push(this);
    this.definition = definition;
    this.active = false;
    this.paused = false;
    this.running = false;
    this.validateCalled = false;
    this.initCalled = false;
    this.authToken = undefined;
    this.jobPool = undefined;
    this.validate = function () {
        this.validateCalled = true;
    };
    this.init = function () {
        this.initCalled = true;
    };
    this.setAuthToken = function (authToken) {
        this.authToken = authToken;
    };
    this.setJobPool = function (jobPool) {
        this.jobPool = jobPool;
    };
    this.getDefinition = function () {
        return this.definition;
    };
    this.isActive = function () {
        return this.active;
    };
    this.isRunning = function () {
        return this.running;
    };
    this.startJob = function () {
        this.active = true;
        this.paused = false;
        return Promise.resolve('started ' + this.definition.code);
    };
    this.stopJob = function () {
        this.active = false;
        return Promise.resolve('stopped ' + this.definition.code);
    };
    this.pauseJob = function () {
        this.paused = true;
        return Promise.resolve('paused ' + this.definition.code);
    };
    this.resumeJob = function () {
        this.paused = false;
        return Promise.resolve('resumed ' + this.definition.code);
    };
}

global.CLASSES = {
    CronJob: FakeCronJob,
    CronJobContainer: require('../src/lib/cronJobContainer'),
    CronJobError,
    NodicsError
};

global.NODICS = {
    getActiveTenants: function () {
        return ['tenantA', 'tenantB'];
    },
    getInternalAuthToken: function (tenant) {
        return 'token-' + tenant;
    }
};

global.SERVICE = {
    DefaultLoggerService: {
        createLogger: function () {
            return logger;
        }
    },
    DefaultPipelineService: {
        start: function () {
            return Promise.resolve(true);
        }
    },
    DefaultCronJobConfigurationService: {
        getDefaultQuery: function () {
            return {
                active: true
            };
        }
    }
};

const cronJobService = require('../src/service/cronjob/defaultCronJobService');
global.SERVICE.DefaultCronJobService = cronJobService;

cronJobService.update = function (request) {
    updateCalls.push(request);
    return Promise.resolve({ result: request.model });
};

const tenantJobs = {
    tenantA: [
        {
            code: 'ownedJob',
            tenant: 'tenantA',
            runOnNode: 'nodeA',
            trigger: { expression: '* * * * * *' },
            jobDetail: {}
        },
        {
            code: 'remoteJob',
            tenant: 'tenantA',
            runOnNode: 'nodeB',
            trigger: { expression: '* * * * * *' },
            jobDetail: {}
        }
    ],
    tenantB: [
        {
            code: 'failoverJob',
            tenant: 'tenantB',
            runOnNode: 'nodeB',
            tempNode: 'nodeA',
            trigger: { expression: '* * * * * *' },
            jobDetail: {}
        }
    ]
};

cronJobService.get = function (request) {
    return Promise.resolve({
        result: (tenantJobs[request.tenant] || []).map(job => Object.assign({}, job))
    });
};

(async function run() {
    updateCalls.length = 0;
    fakeJobs.length = 0;

    const allJobsResult = await cronJobService.createAllJobs(['tenantA', 'tenantB']);

    assert.strictEqual(allJobsResult.code, 'SUC_JOB_00001', 'all-job creation should report partial success when a remote-owned job is skipped');
    assert.strictEqual(allJobsResult.result.length, 2, 'all-job creation should create local and temporary failover jobs');
    assert.strictEqual(allJobsResult.failed.length, 1, 'all-job creation should fail closed for jobs owned by another node');
    assert.deepStrictEqual(fakeJobs.map(job => job.definition.code), ['ownedJob', 'failoverJob'], 'container should instantiate only jobs owned by this node or tempNode');
    assert.deepStrictEqual(updateCalls.map(call => call.query.code), ['ownedJob', 'failoverJob'], 'container should persist CREATED state for instantiated jobs');
    assert.strictEqual(fakeJobs[0].authToken, 'token-tenantA', 'container should inject tenant internal auth token into runtime job');
    assert.strictEqual(fakeJobs[1].authToken, 'token-tenantB', 'container should inject failover tenant internal auth token into runtime job');

    let startResult = await cronJobService.getCronJobContainer().startJobs('tenantA', ['ownedJob']);
    assert.strictEqual(startResult.code, 'SUC_JOB_00000', 'startJobs should succeed for created jobs');
    assert.strictEqual(fakeJobs[0].active, true, 'startJobs should activate the runtime job');

    let manualRunResult = await cronJobService.getCronJobContainer().runJobs({
        tenant: 'tenantA',
        definitions: [Object.assign({}, tenantJobs.tenantA[0])]
    });
    assert.strictEqual(manualRunResult.result.length, 1, 'manual run should succeed for an active tenant-owned job');
    assert.strictEqual(manualRunResult.failed.length, 0, 'manual run should not record failures for an active tenant-owned job');
    assert.strictEqual(fakeJobs[0].paused, false, 'manual run should resume the active tenant-owned job after the one-time execution is scheduled');

    let pauseResult = await cronJobService.getCronJobContainer().pauseJobs('tenantA', ['ownedJob']);
    assert.strictEqual(pauseResult.code, 'SUC_JOB_00000', 'pauseJobs should succeed for created jobs');
    assert.strictEqual(fakeJobs[0].paused, true, 'pauseJobs should pause the runtime job');

    let resumeResult = await cronJobService.getCronJobContainer().resumeJobs('tenantA', ['ownedJob']);
    assert.strictEqual(resumeResult.code, 'SUC_JOB_00000', 'resumeJobs should succeed for created jobs');
    assert.strictEqual(fakeJobs[0].paused, false, 'resumeJobs should resume the runtime job');

    let stopResult = await cronJobService.getCronJobContainer().stopJobs('tenantA', ['ownedJob']);
    assert.strictEqual(stopResult.code, 'SUC_JOB_00000', 'stopJobs should succeed for created jobs');
    assert.strictEqual(fakeJobs[0].active, false, 'stopJobs should deactivate the runtime job');

    let missingStart = await cronJobService.getCronJobContainer().startJobs('tenantA', ['missingJob']);
    assert.strictEqual(missingStart.code, 'SUC_JOB_00000', 'missing job lifecycle should remain idempotent and non-fatal');
    assert(missingStart.result[0].includes('not available'), 'missing job lifecycle should explain the missing runtime job');

    console.log('CronJob runtime container contract validated: startup, ownership, failover, lifecycle');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
