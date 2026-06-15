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

let savedModels = [];
let schemaActivationRequests = [];
let routerActivationRequests = [];
let auditEntries = [];

global.SERVICE = {
    DefaultConfigurationActivationLogService: {
        get: function (request) {
            if (request.query.code === 'schemaAudit') {
                return Promise.resolve({
                    result: [{
                        code: 'schemaAudit',
                        configurationType: 'schemaConfiguration',
                        configurationCode: 'tenant',
                        moduleName: 'profile',
                        nextSnapshot: {
                            code: 'tenant',
                            moduleName: 'profile',
                            definition: {
                                code: {
                                    type: 'string'
                                },
                                displayName: {
                                    type: 'string'
                                }
                            }
                        },
                        previousSnapshot: {
                            code: 'tenant',
                            moduleName: 'profile',
                            definition: {
                                code: {
                                    type: 'string'
                                }
                            }
                        }
                    }]
                });
            }
            return Promise.resolve({
                result: [{
                    code: 'routerAudit',
                    configurationType: 'routerConfiguration',
                    configurationCode: 'runtimeUser',
                    moduleName: 'profile',
                    nextSnapshot: {
                        code: 'runtimeUser',
                        moduleName: 'profile',
                        groupName: 'users',
                        key: '/new/users/:id',
                        method: 'GET',
                        controller: 'RuntimeUserController',
                        operation: 'getUser'
                    },
                    previousSnapshot: {
                        code: 'runtimeUser',
                        moduleName: 'profile',
                        groupName: 'users',
                        key: '/old/users/:id',
                        method: 'GET',
                        controller: 'OldUserController',
                        operation: 'getUser'
                    }
                }]
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
    DefaultSchemaConfigurationService: {
        save: function (request) {
            savedModels.push(request.model);
            return Promise.resolve({
                saved: request.model.code
            });
        },
        handleSchemaUpdate: function (request, schemas) {
            schemaActivationRequests.push({
                request: request,
                schemas: schemas
            });
            return Promise.resolve('Updated all schemas');
        }
    },
    DefaultRouterConfigurationService: {
        save: function (request) {
            savedModels.push(request.model);
            return Promise.resolve({
                saved: request.model.code
            });
        },
        registerRoutersFromDatabase: function (request) {
            routerActivationRequests.push(request);
            return Promise.resolve({
                message: 'Routers successfully activated'
            });
        }
    }
};

const service = require('../src/service/audit/defaultRuntimeConfigurationRollbackService');

service.rollbackActivation({
    tenant: 'default',
    activationCode: 'schemaAudit',
    authData: {
        code: 'admin'
    },
    correlationId: 'schema-rollback'
}).then(success => {
    assert.strictEqual(success.code, 'SUC_SYS_00000');
    assert.strictEqual(savedModels.length, 1);
    assert.strictEqual(savedModels[0].code, 'tenant');
    assert.strictEqual(savedModels[0].moduleName, 'profile');
    assert.strictEqual(savedModels[0].definition.displayName, undefined);
    assert.deepStrictEqual(schemaActivationRequests[0].schemas, ['tenant']);
    assert.strictEqual(auditEntries[0].action, 'rollback');
    assert.strictEqual(auditEntries[0].status, 'SUCCESS');
    assert.strictEqual(auditEntries[0].nextSnapshot.controller, undefined);

    savedModels = [];
    auditEntries = [];
    return service.rollbackActivation({
        tenant: 'default',
        activationCode: 'routerAudit',
        authData: {
            code: 'admin'
        },
        correlationId: 'router-rollback'
    });
}).then(success => {
    assert.strictEqual(success.code, 'SUC_SYS_00000');
    assert.strictEqual(savedModels.length, 1);
    assert.strictEqual(savedModels[0].code, 'runtimeUser');
    assert.strictEqual(savedModels[0].controller, 'OldUserController');
    assert.strictEqual(routerActivationRequests.length, 1);
    assert.strictEqual(routerActivationRequests[0].query.code, 'runtimeUser');
    assert.strictEqual(auditEntries[0].action, 'rollback');
    assert.strictEqual(auditEntries[0].previousSnapshot.controller, 'RuntimeUserController');
    assert.strictEqual(auditEntries[0].nextSnapshot.controller, 'OldUserController');
    console.log('Runtime configuration rollback service validated');
}).catch(error => {
    console.error(error);
    process.exit(1);
});
