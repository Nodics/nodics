/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

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

global.NODICS = {
    getModule: function () {
        return {
            rawSchema: {
                tenant: {
                    definition: {
                        code: {
                            type: 'string'
                        }
                    }
                }
            }
        };
    }
};

let auditEntries = [];
let rawRouters = {
    profile: {
        users: {
            runtimeUser: {
                key: '/old/users/:id',
                method: 'GET',
                controller: 'OldUserController',
                operation: 'getUser'
            }
        }
    }
};

global.SERVICE = {
    DefaultRuntimeConfigurationAuditService: {
        recordActivation: function (entry) {
            auditEntries.push(entry);
            return Promise.resolve(true);
        },
        resolveRequestedBy: function (request) {
            return request && request.authData ? request.authData.code : undefined;
        },
        resolveCorrelationId: function (request) {
            return request && request.correlationId;
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
        registerRouter: function () {
            return Promise.resolve(true);
        }
    },
    DefaultPipelineService: {
        start: function () {
            return Promise.resolve(true);
        }
    }
};

const routerService = require('../src/service/router/defaultRouterConfigurationService');
routerService.get = function () {
    return Promise.resolve({
        result: [{
            moduleName: 'profile',
            groupName: 'users',
            code: 'runtimeUser',
            key: '/new/users/:id',
            method: 'GET',
            controller: 'RuntimeUserController',
            operation: 'getUser'
        }]
    });
};

routerService.registerRoutersFromDatabase({
    tenant: 'default',
    authData: {
        code: 'admin'
    },
    correlationId: 'router-correlation'
}).then(() => {
    assert.strictEqual(auditEntries.length, 1);
    assert.strictEqual(auditEntries[0].configurationType, 'routerConfiguration');
    assert.strictEqual(auditEntries[0].configurationCode, 'runtimeUser');
    assert.strictEqual(auditEntries[0].previousSnapshot.controller, 'OldUserController');
    assert.strictEqual(auditEntries[0].nextSnapshot.controller, 'RuntimeUserController');

    auditEntries = [];
    const schemaService = require('../src/service/schema/defaultSchemaConfigurationService');
    schemaService.get = function () {
        return Promise.resolve({
            result: [{
                code: 'tenant',
                moduleName: 'profile',
                active: true
            }]
        });
    };
    return schemaService.handleSchemaUpdate({
        tenant: 'default',
        authData: {
            code: 'admin'
        },
        correlationId: 'schema-correlation',
        event: {}
    }, ['tenant']);
}).then(() => {
    assert.strictEqual(auditEntries.length, 1);
    assert.strictEqual(auditEntries[0].configurationType, 'schemaConfiguration');
    assert.strictEqual(auditEntries[0].configurationCode, 'tenant');
    assert.strictEqual(auditEntries[0].previousSnapshot.definition.code.type, 'string');
    assert.strictEqual(auditEntries[0].status, 'SUCCESS');
    console.log('Runtime configuration activation audit validated');
}).catch(error => {
    console.error(error);
    process.exit(1);
});
