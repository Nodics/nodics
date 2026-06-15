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

let rawRouters = {
    profile: {
        users: {
            runtimeUser: {
                code: 'runtimeUser',
                moduleName: 'profile',
                groupName: 'users',
                key: '/old/users/:id',
                method: 'GET',
                controller: 'OldUserController',
                operation: 'getUser'
            }
        }
    }
};
let registeredRouters = [];
let auditEntries = [];

global.SERVICE = {
    DefaultRuntimeConfigurationActivationPolicyService: require('../src/service/audit/defaultRuntimeConfigurationActivationPolicyService'),
    DefaultRuntimeConfigurationPreviewService: {
        previewActivation: function () {
            return Promise.resolve({
                data: {
                    destructive: true,
                    warnings: ['route method will change'],
                    changedPaths: ['method']
                }
            });
        }
    },
    DefaultRuntimeConfigurationAuditService: {
        recordActivation: function (entry) {
            auditEntries.push(entry);
            return Promise.resolve(true);
        },
        resolveRequestedBy: function (request) {
            return request.authData && request.authData.code;
        },
        resolveCorrelationId: function (request) {
            return request.correlationId;
        }
    },
    DefaultRouterConfigurationService: {
        getRawRouters: function () {
            return rawRouters;
        },
        setRawRouters: function (routers) {
            rawRouters = routers;
        }
    },
    DefaultFilesLoaderService: {
        mergeRuntimeRouterFiles: function (frameworkFile, runtimeFile) {
            return Object.assign({}, frameworkFile, runtimeFile);
        }
    },
    DefaultRouterService: {
        registerRouter: function (routers) {
            registeredRouters.push(routers);
            return Promise.resolve(true);
        }
    }
};

const routerService = require('../src/service/router/defaultRouterConfigurationService');
routerService.get = function () {
    return Promise.resolve({
        result: [{
            code: 'runtimeUser',
            moduleName: 'profile',
            groupName: 'users',
            key: '/new/users/:id',
            method: 'POST',
            controller: 'RuntimeUserController',
            operation: 'saveUser'
        }]
    });
};

routerService.registerRoutersFromDatabase({
    tenant: 'default',
    authData: {
        code: 'admin'
    },
    correlationId: 'blocked-router'
}).then(() => {
    throw new Error('Destructive router activation without approval should fail');
}).catch(error => {
    assert.strictEqual(error.code, 'ERR_SYS_00002');
    assert.strictEqual(registeredRouters.length, 0);
    assert.strictEqual(auditEntries.length, 1);
    assert.strictEqual(auditEntries[0].status, 'FAILED');
    assert.strictEqual(auditEntries[0].approvalStatus, 'REQUIRED');
    assert.strictEqual(auditEntries[0].riskLevel, 'HIGH');

    auditEntries = [];
    return routerService.registerRoutersFromDatabase({
        tenant: 'default',
        authData: {
            code: 'admin'
        },
        activationApproval: {
            approved: true,
            approvedBy: 'change-manager',
            approvalReason: 'Approved change ticket'
        },
        correlationId: 'approved-router'
    });
}).then(success => {
    assert.strictEqual(success.message, 'Routers successfully activated');
    assert.strictEqual(registeredRouters.length, 1);
    assert.strictEqual(auditEntries.length, 1);
    assert.strictEqual(auditEntries[0].approvalStatus, 'APPROVED');
    assert.strictEqual(auditEntries[0].approvedBy, 'change-manager');
    assert.strictEqual(auditEntries[0].riskLevel, 'HIGH');
    assert.deepStrictEqual(auditEntries[0].warnings, ['route method will change']);
    console.log('Runtime configuration activation policy enforcement validated');
}).catch(error => {
    console.error(error);
    process.exit(1);
});
