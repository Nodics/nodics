/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

/**
 * @module import/test/importTargetDispatchContract
 * @description Verifies model import target dispatch sends schema imports to
 * generated database services and search imports to search operation services
 * while accepting normal search result response shapes.
 * @layer test
 * @owner import
 * @override Project modules may add target-specific import dispatch tests while
 * preserving the database/search target routing contract.
 */

global.UTILS = {
    isArray: Array.isArray
};

global.CLASSES = {
    DataImportError: class DataImportError extends Error {
        constructor(error, message, code) {
            super(message || (error && error.message) || error || code);
            this.code = code || (error && error.code) || error;
            this.errors = [];
        }
        add(error) {
            this.errors.push(error);
        }
    }
};

const serviceDefinition = require('../src/service/process/model/defaultModelImportProcessService');

if (!String.prototype.toUpperCaseFirstChar) {
    Object.defineProperty(String.prototype, 'toUpperCaseFirstChar', {
        value: function () {
            return this.charAt(0).toUpperCase() + this.slice(1);
        }
    });
}

function createService() {
    return Object.assign({}, serviceDefinition, {
        LOG: {
            debug: function () {},
            warn: function () {}
        }
    });
}

async function insertModel(request) {
    const service = createService();
    const response = {};
    await new Promise((resolve, reject) => {
        service.insertModel(request, response, {
            nextSuccess: function () {
                resolve(true);
            },
            error: function (_request, _response, error) {
                reject(error);
            }
        });
    });
    return response.success;
}

(async function () {
    let calls = [];
    global.NODICS = {
        isModuleActive: function () {
            return true;
        }
    };
    global.SERVICE = {
        DefaultCatalogService: {
            saveAll: function (request) {
                calls.push({
                    target: 'schema',
                    request: request
                });
                return Promise.resolve({
                    result: request.models.map(model => Object.assign({ persisted: true }, model))
                });
            }
        },
        DefaultSearchService: {
            doSave: function (request) {
                calls.push({
                    target: 'search',
                    request: request
                });
                return Promise.resolve({
                    code: 'SUC_SRCH_00001',
                    result: request.models.map(model => ({
                        code: model.code,
                        indexed: true
                    }))
                });
            }
        }
    };

    let schemaResult = await insertModel({
        tenant: 'electronics',
        options: { validate: true },
        searchOptions: { projection: { _id: 0 } },
        header: {
            query: { catalog: 'electronics' },
            options: {
                moduleName: 'catalog',
                schemaName: 'catalog',
                operation: 'saveAll',
                userGroups: ['catalogImporterUserGroup']
            }
        },
        dataModel: [
            { code: 'catalog-001' },
            { code: 'catalog-002' }
        ]
    });

    assert.deepStrictEqual(schemaResult.map(model => model.code), ['catalog-001', 'catalog-002']);
    assert.strictEqual(calls[0].target, 'schema');
    assert.strictEqual(calls[0].request.tenant, 'electronics');
    assert.deepStrictEqual(calls[0].request.authData.userGroups, ['catalogImporterUserGroup']);
    assert.deepStrictEqual(calls[0].request.query, { catalog: 'electronics' });
    assert.deepStrictEqual(calls[0].request.models.map(model => model.code), ['catalog-001', 'catalog-002']);

    let searchResult = await insertModel({
        tenant: 'electronics',
        moduleName: 'catalog',
        header: {
            options: {
                moduleName: 'catalog',
                indexName: 'product',
                operation: 'doSave',
                userGroups: ['searchImporterUserGroup']
            }
        },
        dataModel: [
            { code: 'product-001' },
            { code: 'product-002' }
        ]
    });

    assert.deepStrictEqual(searchResult, [
        { code: 'product-001', indexed: true },
        { code: 'product-002', indexed: true }
    ]);
    assert.strictEqual(calls[1].target, 'search');
    assert.strictEqual(calls[1].request.tenant, 'electronics');
    assert.strictEqual(calls[1].request.indexName, 'product');
    assert.strictEqual(calls[1].request.moduleName, 'catalog');
    assert.deepStrictEqual(calls[1].request.authData.userGroups, ['searchImporterUserGroup']);
    assert.deepStrictEqual(calls[1].request.model, { code: 'product-001' });
    assert.deepStrictEqual(calls[1].request.models, [
        { code: 'product-001' },
        { code: 'product-002' }
    ]);

    global.SERVICE.DefaultSearchService.doSave = function () {
        return Promise.resolve({
            errors: [
                { code: 'ERR_SRCH_00000', message: 'Search import failed' }
            ]
        });
    };

    try {
        await insertModel({
            tenant: 'electronics',
            header: {
                options: {
                    moduleName: 'catalog',
                    indexName: 'product',
                    operation: 'doSave',
                    userGroups: ['searchImporterUserGroup']
                }
            },
        dataModel: [
            { code: 'product-001' },
            { code: 'product-002' }
        ]
    });
        assert.fail('Expected search import errors to reject');
    } catch (error) {
        assert.strictEqual(error.code, 'ERR_SRCH_00000');
    }

    console.log('Import target dispatch contract validated for schema and search targets');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
