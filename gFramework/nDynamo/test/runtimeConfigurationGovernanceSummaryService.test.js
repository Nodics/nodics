const assert = require('assert');

global.CONFIG = {
    get: function () {
        return 'default';
    }
};

global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(code, message) {
            super(message || code);
            this.code = code;
        }
    }
};

const activationRequests = [
    {
        code: 'activationRequest_router_userRoute',
        configurationType: 'routerConfiguration',
        configurationCode: 'userRoute',
        moduleName: 'profile',
        approvalStatus: 'PENDING',
        status: 'REQUESTED',
        riskLevel: 'HIGH',
        preview: {
            destructive: true
        }
    },
    {
        code: 'activationRequest_schema_tenant',
        configurationType: 'schemaConfiguration',
        configurationCode: 'tenant',
        moduleName: 'profile',
        approvalStatus: 'APPROVED',
        status: 'APPROVED',
        riskLevel: 'LOW',
        preview: {
            destructive: false
        }
    },
    {
        code: 'activationRequest_router_orderRoute',
        configurationType: 'routerConfiguration',
        configurationCode: 'orderRoute',
        moduleName: 'order',
        approvalStatus: 'REJECTED',
        status: 'REJECTED',
        riskLevel: 'LOW'
    }
];

const activationLogs = [
    {
        code: 'routerConfiguration_userRoute_1',
        configurationType: 'routerConfiguration',
        configurationCode: 'userRoute',
        moduleName: 'profile',
        action: 'activate',
        status: 'SUCCESS',
        riskLevel: 'HIGH'
    },
    {
        code: 'schemaConfiguration_tenant_1',
        configurationType: 'schemaConfiguration',
        configurationCode: 'tenant',
        moduleName: 'profile',
        action: 'activate',
        status: 'FAILED',
        riskLevel: 'LOW'
    },
    {
        code: 'routerConfiguration_orderRoute_1',
        configurationType: 'routerConfiguration',
        configurationCode: 'orderRoute',
        moduleName: 'order',
        action: 'rollback',
        status: 'SUCCESS',
        riskLevel: 'LOW'
    }
];

let requestQuery;
let logQuery;
let requestSearchOptions;
let logSearchOptions;
global.SERVICE = {
    DefaultConfigurationActivationRequestService: {
        get: function (request) {
            requestQuery = request.query;
            requestSearchOptions = request.searchOptions;
            return Promise.resolve({
                result: activationRequests
            });
        }
    },
    DefaultConfigurationActivationLogService: {
        get: function (request) {
            logQuery = request.query;
            logSearchOptions = request.searchOptions;
            return Promise.resolve({
                result: activationLogs
            });
        }
    }
};

const service = require('../src/service/audit/defaultRuntimeConfigurationGovernanceSummaryService');

service.getGovernanceSummary({
    tenant: 'default',
    httpRequest: {
        query: {
            configurationType: 'routerConfiguration',
            moduleName: 'profile',
            limit: '25',
            recentLimit: '2'
        }
    }
}).then(summary => {
    assert.strictEqual(summary.code, 'SUC_SYS_00000');
    assert.strictEqual(summary.metadata.tenant, 'default');
    assert.strictEqual(summary.metadata.requestQuery.configurationType, 'routerConfiguration');
    assert.strictEqual(summary.metadata.activationQuery.moduleName, 'profile');
    assert.strictEqual(requestQuery.moduleName, 'profile');
    assert.strictEqual(logQuery.configurationType, 'routerConfiguration');
    assert.strictEqual(requestSearchOptions.limit, 25);
    assert.strictEqual(logSearchOptions.limit, 25);

    assert.strictEqual(summary.data.requests.total, 3);
    assert.strictEqual(summary.data.requests.pending, 1);
    assert.strictEqual(summary.data.requests.approved, 1);
    assert.strictEqual(summary.data.requests.rejected, 1);
    assert.strictEqual(summary.data.requests.approvedNotActivated, 1);
    assert.strictEqual(summary.data.requests.highRisk, 1);
    assert.strictEqual(summary.data.requests.destructive, 1);
    assert.strictEqual(summary.data.requests.byModule.profile, 2);
    assert.strictEqual(summary.data.requests.recentPending.length, 1);

    assert.strictEqual(summary.data.activations.total, 3);
    assert.strictEqual(summary.data.activations.success, 2);
    assert.strictEqual(summary.data.activations.failed, 1);
    assert.strictEqual(summary.data.activations.rollback, 1);
    assert.strictEqual(summary.data.activations.highRisk, 1);
    assert.strictEqual(summary.data.activations.recentFailures.length, 1);
    assert.strictEqual(summary.data.activations.recentRollbacks.length, 1);

    assert.strictEqual(summary.data.modules.profile.requests, 2);
    assert.strictEqual(summary.data.modules.profile.pending, 1);
    assert.strictEqual(summary.data.modules.profile.activations, 2);
    assert.strictEqual(summary.data.modules.profile.failed, 1);
    assert.strictEqual(summary.data.modules.order.rollbacks, 1);
    assert.strictEqual(summary.data.configurationTypes.requests.routerConfiguration, 2);
    assert.strictEqual(summary.data.configurationTypes.activations.schemaConfiguration, 1);
    console.log('Runtime configuration governance summary service validated');
}).catch(error => {
    console.error(error);
    process.exit(1);
});
