/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

global.SERVICE = {};
global.CONFIG = {
    get: function (key) {
        if (key === 'cache') return { enabled: true };
    }
};
global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(error, message, code) {
            super(message || (error && error.message) || error || code);
            this.code = code || error;
        }
    }
};

const readPolicyService = require('../src/service/schema/defaultSchemaReadAccessPolicyService');
const getInitializerService = require('../src/service/procs/get/defaultModelsGetInitializerService');
const pipelines = require('../src/pipelines/pipelines');

let request = {
    tenant: 'electronics',
    authData: {
        userGroups: ['catalogViewerUserGroup']
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
    }
};

let requestedProperties = [];
global.SERVICE.DefaultSchemaAccessPolicyResolverService = {
    resolveAccess: function (policyRequest, context) {
        requestedProperties.push(context.propertyName);
        let effects = {
            productDescription: {
                effect: 'MASK',
                maskStrategy: 'last4',
                policyCode: 'maskDescription'
            },
            internalCost: {
                effect: 'HIDE',
                policyCode: 'hideCost'
            },
            searchText: {
                effect: 'DENY',
                policyCode: 'denySearchText'
            }
        };
        return Promise.resolve(Object.assign({
            allowed: true,
            effect: 'ALLOW',
            policyCode: undefined
        }, effects[context.propertyName] || {}));
    }
};

let response = {
    success: {
        result: [{
            code: 'product-001',
            productDescription: 'Sensitive description 1234',
            internalCost: 99,
            searchText: 'secret'
        }]
    }
};

readPolicyService.applyReadPolicies(request, response).then(filteredResponse => {
    assert.deepStrictEqual(requestedProperties.sort(), ['code', 'internalCost', 'productDescription', 'searchText'].sort());
    assert.strictEqual(filteredResponse.success.result[0].code, 'product-001');
    assert.strictEqual(filteredResponse.success.result[0].productDescription, '**********************1234');
    assert.strictEqual(filteredResponse.success.result[0].internalCost, undefined);
    assert.strictEqual(filteredResponse.success.result[0].searchText, undefined);
    assert.strictEqual(filteredResponse.success.policy.appliedCount, 3);
    assert(filteredResponse.success.policy.applied.some(entry => entry.propertyName === 'productDescription' && entry.effect === 'MASK'));
    assert(filteredResponse.success.policy.applied.some(entry => entry.propertyName === 'internalCost' && entry.effect === 'HIDE'));
    assert(filteredResponse.success.policy.applied.some(entry => entry.propertyName === 'searchText' && entry.effect === 'DENY'));

    delete global.SERVICE.DefaultSchemaAccessPolicyResolverService;
    let noOpResponse = {
        success: {
            result: [{
                code: 'product-002',
                internalCost: 101
            }]
        }
    };
    return readPolicyService.applyReadPolicies(request, noOpResponse).then(success => {
        assert.strictEqual(success.success.result[0].internalCost, 101);

        assert.strictEqual(
            pipelines.modelsGetInitializerPipeline.nodes.updateCache.success,
            'applyReadAccessPolicies'
        );
        assert.strictEqual(
            pipelines.modelsGetInitializerPipeline.nodes.applyReadAccessPolicies.handler,
            'DefaultModelsGetInitializerService.applyReadAccessPolicies'
        );

        let stoppedValue;
        global.SERVICE.DefaultCacheConfigurationService = {
            createItemKey: function () {
                return 'cache-key';
            }
        };
        global.SERVICE.DefaultCacheService = {
            getSchemaCacheChannel: function () {
                return 'product';
            },
            get: function () {
                return Promise.resolve({
                    result: [{
                        code: 'product-003',
                        internalCost: 102
                    }]
                });
            }
        };
        global.SERVICE.DefaultSchemaReadAccessPolicyService = {
            applyReadPolicies: function (policyRequest, policyResponse) {
                delete policyResponse.success.result[0].internalCost;
                return Promise.resolve(policyResponse);
            }
        };
        return new Promise((resolve, reject) => {
            getInitializerService.LOG = {
                debug: function () {},
                warn: function () {}
            };
            getInitializerService.lookupCache(Object.assign({}, request, {
                cacheKeyHash: 'cache-key',
                schemaModel: Object.assign({}, request.schemaModel, {
                    cache: {
                        enabled: true
                    }
                })
            }), {}, {
                stop: function (req, res, value) {
                    stoppedValue = value;
                    resolve(true);
                },
                nextSuccess: function () {
                    reject(new Error('Cache hit should stop after applying read access policies'));
                },
                error: function (req, res, error) {
                    reject(error);
                }
            });
        }).then(() => {
            assert.strictEqual(stoppedValue.result[0].code, 'product-003');
            assert.strictEqual(stoppedValue.result[0].internalCost, undefined);
            console.log('Schema read access policy service validated');
        });
    });
}).catch(error => {
    console.error(error);
    process.exit(1);
});
