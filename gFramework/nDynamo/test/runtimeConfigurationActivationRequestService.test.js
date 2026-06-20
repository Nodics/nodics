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

let storedRequests = {};
let schemaActivations = [];
let routerActivations = [];
let queryRequests = [];

global.SERVICE = {
    DefaultRuntimeConfigurationPreviewService: {
        previewActivation: function () {
            return Promise.resolve({
                data: {
                    configurationType: 'routerConfiguration',
                    configurationCode: 'runtimeUser',
                    moduleName: 'profile',
                    destructive: true,
                    warnings: ['route method will change'],
                    changedPaths: ['method']
                }
            });
        }
    },
    DefaultConfigurationActivationRequestService: {
        save: function (request) {
            storedRequests[request.model.code] = request.model;
            return Promise.resolve({
                result: [request.model]
            });
        },
        get: function (request) {
            queryRequests.push(request);
            if (request.query.approvalStatus) {
                return Promise.resolve({
                    result: Object.keys(storedRequests).map(key => storedRequests[key]).filter(model => {
                        return model.approvalStatus === request.query.approvalStatus;
                    })
                });
            }
            return Promise.resolve({
                result: storedRequests[request.query.code] ? [storedRequests[request.query.code]] : []
            });
        }
    },
    DefaultSchemaConfigurationService: {
        handleSchemaUpdate: function (request, schemas) {
            schemaActivations.push({
                request: request,
                schemas: schemas
            });
            return Promise.resolve('Updated all schemas');
        }
    },
    DefaultRouterConfigurationService: {
        registerRoutersFromDatabase: function (request) {
            routerActivations.push(request);
            return Promise.resolve({
                message: 'Routers successfully activated'
            });
        }
    }
};

const service = require('../src/service/audit/defaultRuntimeConfigurationActivationRequestService');

service.createActivationRequest({
    tenant: 'default',
    authData: {
        code: 'requester'
    },
    correlationId: 'request-correlation',
    activationRequest: {
        code: 'activationRequest_runtimeUser_1',
        requestedBy: 'spoofed-requester',
        configurationType: 'routerConfiguration',
        configurationCode: 'runtimeUser',
        requestReason: 'Need new runtime route'
    }
}).then(success => {
    assert.strictEqual(success.code, 'SUC_SYS_00000');
    assert.strictEqual(success.data.code, 'activationRequest_runtimeUser_1');
    assert.strictEqual(success.data.approvalStatus, 'PENDING');
    assert.strictEqual(success.data.riskLevel, 'HIGH');
    assert.strictEqual(success.data.requestedBy, 'requester');

    return service.approveActivationRequest({
        tenant: 'default',
        authData: {
            code: 'approver'
        },
        activationRequest: {
            activationRequestCode: 'activationRequest_runtimeUser_1',
            approvedBy: 'spoofed-approver',
            approvalReason: 'Approved change ticket'
        }
    });
}).then(success => {
    assert.strictEqual(success.data.approvalStatus, 'APPROVED');
    assert.strictEqual(success.data.status, 'APPROVED');
    assert.strictEqual(success.data.approvedBy, 'approver');
    assert.strictEqual(success.data.approvalReason, 'Approved change ticket');

    return service.activateApprovedRequest({
        tenant: 'default',
        authData: {
            code: 'operator'
        },
        activationRequest: {
            activationRequestCode: 'activationRequest_runtimeUser_1'
        }
    });
}).then(success => {
    assert.strictEqual(success.code, 'SUC_SYS_00000');
    assert.strictEqual(success.data.status, 'ACTIVATED');
    assert.strictEqual(routerActivations.length, 1);
    assert.strictEqual(routerActivations[0].activationRequestCode, 'activationRequest_runtimeUser_1');
    assert.strictEqual(routerActivations[0].activationApproval.approved, true);
    assert.strictEqual(routerActivations[0].activationApproval.approvedBy, 'approver');

    return service.getActivationRequests({
        tenant: 'default',
        activationRequest: {
            approvalStatus: 'APPROVED',
            riskLevel: 'HIGH',
            limit: '10'
        }
    });
}).then(success => {
    assert.strictEqual(success.code, 'SUC_SYS_00000');
    assert.strictEqual(success.metadata.query.approvalStatus, 'APPROVED');
    assert.strictEqual(success.metadata.query.riskLevel, 'HIGH');
    assert.strictEqual(success.metadata.tenant, 'default');
    assert.strictEqual(queryRequests[queryRequests.length - 1].searchOptions.limit, 10);

    storedRequests.schemaRequest = {
        code: 'schemaRequest',
        configurationType: 'schemaConfiguration',
        configurationCode: 'tenant',
        approvalStatus: 'APPROVED',
        approvedBy: 'approver',
        approvalReason: 'Approved schema',
        status: 'APPROVED'
    };
    return service.activateApprovedRequest({
        tenant: 'default',
        authData: { code: 'schemaOperator' },
        activationRequest: {
            activationRequestCode: 'schemaRequest'
        }
    });
}).then(success => {
    assert.strictEqual(success.code, 'SUC_SYS_00000');
    assert.strictEqual(schemaActivations.length, 1);
    assert.deepStrictEqual(schemaActivations[0].schemas, ['tenant']);
    assert.strictEqual(schemaActivations[0].request.activationRequestCode, 'schemaRequest');
    console.log('Runtime configuration activation request service validated');
}).catch(error => {
    console.error(error);
    process.exit(1);
});
