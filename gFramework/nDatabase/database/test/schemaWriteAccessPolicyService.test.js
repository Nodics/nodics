/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

global.SERVICE = {};
global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(error, message, code) {
            super(message || (error && error.message) || error || code);
            this.code = code || error;
        }
    }
};

const writePolicyService = require('../src/service/schema/defaultSchemaWriteAccessPolicyService');
const saveInitializerService = require('../src/service/procs/save/defaultModelSaveInitializerService');
const updateInitializerService = require('../src/service/procs/update/defaultModelsUpdateInitializerService');
const removeInitializerService = require('../src/service/procs/remove/defaultModelsRemoveInitializerService');
const pipelines = require('../src/pipelines/pipelinesDefinition');

let request = {
    tenant: 'electronics',
    authData: {
        userGroups: ['catalogEditorUserGroup']
    },
    schemaModel: {
        moduleName: 'catalog',
        schemaName: 'product',
        rawSchema: {
            definition: {
                code: { type: 'string' },
                productDescription: { type: 'string' },
                internalCost: { type: 'number' },
                searchText: { type: 'string' }
            }
        }
    },
    model: {
        code: 'product-001',
        productDescription: 'Public description',
        internalCost: 99
    }
};

let requestedContexts = [];
global.SERVICE.DefaultSchemaAccessPolicyResolverService = {
    resolveAccess: function (policyRequest, context) {
        requestedContexts.push(context);
        let effects = {
            code: {
                effect: 'READONLY',
                policyCode: 'readonlyCode'
            },
            internalCost: {
                effect: 'DENY',
                policyCode: 'denyCost'
            }
        };
        return Promise.resolve(Object.assign({
            allowed: true,
            effect: 'ALLOW',
            policyCode: undefined
        }, effects[context.propertyName] || {}));
    }
};

writePolicyService.enforceCreatePolicies(request, {}).then(() => {
    throw new Error('Create should fail when protected properties are submitted');
}).catch(error => {
    assert.strictEqual(error.code, 'ERR_AUTH_00003');
    assert.deepStrictEqual(error.metadata.violations.map(violation => violation.propertyName).sort(), ['code', 'internalCost']);
    assert(requestedContexts.some(context => context.action === 'create' && context.propertyName === 'code'));

    requestedContexts = [];
    let allowedRequest = Object.assign({}, request, {
        model: {
            productDescription: 'Public description'
        }
    });
    return writePolicyService.enforceCreatePolicies(allowedRequest, {}).then(success => {
        assert(requestedContexts.some(context => context.action === 'create' && context.propertyName === 'productDescription'));
        assert.strictEqual(success.policy.create.evaluated.length, 1);

        requestedContexts = [];
        let updateRequest = Object.assign({}, request, {
            model: {
                $set: {
                    'internalCost.amount': 101,
                    productDescription: 'Updated description'
                }
            }
        });
        return writePolicyService.enforceUpdatePolicies(updateRequest, {});
    });
}).then(() => {
    throw new Error('Update should fail when protected operator fields are submitted');
}).catch(error => {
    assert.strictEqual(error.code, 'ERR_AUTH_00003');
    assert.deepStrictEqual(error.metadata.violations.map(violation => violation.propertyName), ['internalCost']);
    assert(requestedContexts.some(context => context.action === 'update' && context.propertyName === 'internalCost'));

    requestedContexts = [];
    global.SERVICE.DefaultSchemaAccessPolicyResolverService = {
        resolveAccess: function (policyRequest, context) {
            requestedContexts.push(context);
            return Promise.resolve({
                allowed: false,
                effect: context.action === 'delete' && context.propertyName === '*' ? 'DENY' : 'ALLOW',
                policyCode: context.action === 'delete' ? 'denyProductDelete' : undefined
            });
        }
    };
    return writePolicyService.enforceDeletePolicies(Object.assign({}, request, {
        query: {
            code: 'product-001'
        }
    }), {});
}).then(() => {
    throw new Error('Delete should fail when schema-level delete policy denies access');
}).catch(error => {
    assert.strictEqual(error.code, 'ERR_AUTH_00003');
    assert.deepStrictEqual(error.metadata.violations, [{
        propertyName: '*',
        effect: 'DENY',
        policyCode: 'denyProductDelete'
    }]);
    assert(requestedContexts.some(context => context.action === 'delete' && context.propertyName === '*'));

    delete global.SERVICE.DefaultSchemaAccessPolicyResolverService;
    let noOpRequest = Object.assign({}, request, {
        model: {
            code: 'product-002'
        }
    });
    return writePolicyService.enforceCreatePolicies(noOpRequest, {}).then(success => {
        assert.deepStrictEqual(success, {});

        assert.strictEqual(
            pipelines.modelSaveInitializerPipeline.nodes.checkAccess.success,
            'enforceCreateAccessPolicies'
        );
        assert.strictEqual(
            pipelines.modelSaveInitializerPipeline.nodes.enforceCreateAccessPolicies.handler,
            'DefaultModelSaveInitializerService.enforceCreateAccessPolicies'
        );
        assert.strictEqual(
            pipelines.modelsUpdateInitializerPipeline.nodes.buildQuery.success,
            'enforceUpdateAccessPolicies'
        );
        assert.strictEqual(
            pipelines.modelsUpdateInitializerPipeline.nodes.enforceUpdateAccessPolicies.handler,
            'DefaultModelsUpdateInitializerService.enforceUpdateAccessPolicies'
        );
        assert.strictEqual(
            pipelines.modelsRemoveInitializerPipeline.nodes.checkAccess.success,
            'enforceDeleteAccessPolicies'
        );
        assert.strictEqual(
            pipelines.modelsRemoveInitializerPipeline.nodes.enforceDeleteAccessPolicies.handler,
            'DefaultModelsRemoveInitializerService.enforceDeleteAccessPolicies'
        );

        let createStepAdvanced = false;
        global.SERVICE.DefaultSchemaWriteAccessPolicyService = {
            enforceCreatePolicies: function () {
                return Promise.resolve(true);
            }
        };
        saveInitializerService.LOG = {
            debug: function () {}
        };
        return new Promise((resolve, reject) => {
            saveInitializerService.enforceCreateAccessPolicies(noOpRequest, {}, {
                nextSuccess: function () {
                    createStepAdvanced = true;
                    resolve(true);
                },
                error: function (req, res, stepError) {
                    reject(stepError);
                }
            });
        }).then(() => {
            assert.strictEqual(createStepAdvanced, true);

            let deleteStepFailed = false;
            global.SERVICE.DefaultSchemaWriteAccessPolicyService = {
                enforceDeletePolicies: function () {
                    return Promise.reject(new CLASSES.NodicsError('ERR_AUTH_00003', 'blocked'));
                }
            };
            removeInitializerService.LOG = {
                debug: function () {}
            };
            return new Promise((resolve, reject) => {
                removeInitializerService.enforceDeleteAccessPolicies(Object.assign({}, noOpRequest, {
                    query: {
                        code: 'product-002'
                    }
                }), {}, {
                    nextSuccess: function () {
                        reject(new Error('Blocked delete should not advance'));
                    },
                    error: function (req, res, stepError) {
                        deleteStepFailed = true;
                        assert.strictEqual(stepError.code, 'ERR_AUTH_00003');
                        resolve(true);
                    }
                });
            }).then(() => {
                assert.strictEqual(deleteStepFailed, true);
            });
        }).then(() => {
            let updateStepFailed = false;
            global.SERVICE.DefaultSchemaWriteAccessPolicyService = {
                enforceUpdatePolicies: function () {
                    return Promise.reject(new CLASSES.NodicsError('ERR_AUTH_00003', 'blocked'));
                }
            };
            updateInitializerService.LOG = {
                debug: function () {}
            };
            return new Promise((resolve, reject) => {
                updateInitializerService.enforceUpdateAccessPolicies(noOpRequest, {}, {
                    nextSuccess: function () {
                        reject(new Error('Blocked update should not advance'));
                    },
                    error: function (req, res, stepError) {
                        updateStepFailed = true;
                        assert.strictEqual(stepError.code, 'ERR_AUTH_00003');
                        resolve(true);
                    }
                });
            }).then(() => {
                assert.strictEqual(updateStepFailed, true);
                console.log('Schema write access policy service validated');
            });
        });
    });
}).catch(error => {
    console.error(error);
    process.exit(1);
});
