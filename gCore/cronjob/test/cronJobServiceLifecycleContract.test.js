const assert = require('assert');

const containerCalls = [];

function CronJobContainerStub() {
    this.createJobs = function (input) {
        containerCalls.push({ operation: 'createJobs', input });
        return Promise.resolve({ result: ['created'], failed: [] });
    };
    this.updateJobs = function (input) {
        containerCalls.push({ operation: 'updateJobs', input });
        return Promise.resolve({ result: ['updated'], failed: [] });
    };
    this.runJobs = function (input) {
        containerCalls.push({ operation: 'runJobs', input });
        return Promise.resolve({ result: ['ran'], failed: [] });
    };
    this.startJobs = function (tenant, jobCodes) {
        containerCalls.push({ operation: 'startJobs', tenant, jobCodes });
        return Promise.resolve({ result: ['started'], failed: [] });
    };
    this.stopJobs = function (tenant, jobCodes) {
        containerCalls.push({ operation: 'stopJobs', tenant, jobCodes });
        return Promise.resolve({ result: ['stopped'], failed: [] });
    };
    this.removeJobs = function (tenant, jobCodes) {
        containerCalls.push({ operation: 'removeJobs', tenant, jobCodes });
        return Promise.resolve({ result: ['removed'], failed: [] });
    };
    this.pauseJobs = function (tenant, jobCodes) {
        containerCalls.push({ operation: 'pauseJobs', tenant, jobCodes });
        return Promise.resolve({ result: ['paused'], failed: [] });
    };
    this.resumeJobs = function (tenant, jobCodes) {
        containerCalls.push({ operation: 'resumeJobs', tenant, jobCodes });
        return Promise.resolve({ result: ['resumed'], failed: [] });
    };
}

global.CLASSES = {
    CronJobContainer: CronJobContainerStub
};

global.NODICS = {
    getActiveTenants: function () {
        return ['tenantA'];
    }
};

global.SERVICE = {
    DefaultCronJobConfigurationService: {
        getDefaultQuery: function () {
            return { active: true };
        }
    }
};

const service = require('../src/service/cronjob/defaultCronJobService');

const getCalls = [];
service.get = function (request) {
    getCalls.push(request);
    return Promise.resolve({
        result: [
            { code: 'jobA', trigger: { expression: '* * * * * *' } },
            { code: 'jobB', tenant: 'customTenant', trigger: { expression: '* * * * * *' } }
        ]
    });
};
global.SERVICE.DefaultCronJobService = service;

async function assertLifecycleCall(operation, expectedContainerOperation) {
    containerCalls.length = 0;
    await service[operation]({
        tenant: 'tenantA',
        jobCodes: ['jobA', 'jobB']
    });

    assert.strictEqual(containerCalls.length, 1, `${operation} should call container once`);
    assert.strictEqual(containerCalls[0].operation, expectedContainerOperation);
    assert.strictEqual(containerCalls[0].tenant, 'tenantA');
    assert.deepStrictEqual(containerCalls[0].jobCodes, ['jobA', 'jobB']);
}

(async function run() {
    const jobs = await service.getTenantsJobs({ query: { code: 'jobA' } }, ['tenantA']);
    assert.strictEqual(jobs.length, 2, 'getTenantsJobs should return tenant jobs');
    assert.strictEqual(jobs[0].tenant, 'tenantA', 'getTenantsJobs should default missing job tenant from request tenant');
    assert.strictEqual(jobs[1].tenant, 'customTenant', 'getTenantsJobs should preserve explicit job tenant');
    assert.deepStrictEqual(getCalls[0].query, { code: 'jobA' });

    containerCalls.length = 0;
    const createResult = await service.createJob({ tenant: 'tenantA', query: { code: 'jobA' } });
    assert.strictEqual(createResult.code, 'SUC_JOB_00000');
    assert.strictEqual(containerCalls[0].operation, 'createJobs');
    assert.strictEqual(containerCalls[0].input.tenant, 'tenantA');
    assert.strictEqual(containerCalls[0].input.definitions.length, 2);

    containerCalls.length = 0;
    await service.updateJob({ tenant: 'tenantA', query: { code: 'jobA' } });
    assert.strictEqual(containerCalls[0].operation, 'updateJobs');

    containerCalls.length = 0;
    await service.runJob({ tenant: 'tenantA', query: { code: 'jobA' } });
    assert.strictEqual(containerCalls[0].operation, 'runJobs');

    await assertLifecycleCall('startJob', 'startJobs');
    await assertLifecycleCall('stopJob', 'stopJobs');
    await assertLifecycleCall('removeJob', 'removeJobs');
    await assertLifecycleCall('pauseJob', 'pauseJobs');
    await assertLifecycleCall('resumeJob', 'resumeJobs');

    console.log('CronJob service lifecycle contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
