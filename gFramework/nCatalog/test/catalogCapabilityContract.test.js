/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nCatalog/test/catalogCapabilityContract
 * @description Verifies nCatalog schema metadata, import catalog data, sample hierarchy, and sub-catalog resolver behavior.
 * @layer test
 * @owner nCatalog
 * @override Project modules may add catalog types, data, and hierarchy behavior in later layers, but the framework catalog capability must keep generated schema, bootstrap data, and resolver contracts stable.
 */

const assert = require('assert');

global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(error, message, code) {
            super(message || (error && error.message) || error);
            this.code = code;
            this.cause = error;
        }
    }
};

const calls = [];
global.SERVICE = {
    DefaultCatalogService: {
        get: function (request) {
            calls.push(request);
            const children = {
                defaultProductCatalog: [{ code: 'inProductCatalog' }, { code: 'uaeProductCatalog' }],
                defaultContentCatalog: []
            };
            return Promise.resolve({ result: children[request.query.superCatalog] || [] });
        }
    }
};

const schemaDefinitions = require('../src/schemas/schemas');
const initHeader = require('../data/init/headers/catalog/defaultCatalogHeader');
const initData = require('../data/init/data/catalog/defaultCatalogData');
const sampleHeader = require('../data/sample/headers/samples/defaultSamplesCatalogHeader');
const sampleData = require('../data/sample/data/samples/defaultSamplesCatalogData');
const resolver = require('../src/service/interceptors/defaultSubCatalogsResolveInterceptorService');

(async function run() {
    const catalogSchema = schemaDefinitions.catalog.catalog;
    assert.strictEqual(catalogSchema.super, 'base');
    assert.strictEqual(catalogSchema.model, true);
    assert.strictEqual(catalogSchema.service.enabled, true);
    assert.strictEqual(catalogSchema.router.enabled, true);
    assert.strictEqual(catalogSchema.refSchema.subCatalogs.schemaName, 'catalog');
    assert.strictEqual(catalogSchema.refSchema.subCatalogs.type, 'many');
    assert.deepStrictEqual(catalogSchema.definition.accessGroups.default, ['contentUserGroup', 'employeeUserGroup']);

    assert.strictEqual(initHeader.catalog.defaultCatalogData.options.schemaName, 'catalog');
    assert.strictEqual(initHeader.catalog.defaultCatalogData.options.operation, 'saveAll');
    assert.strictEqual(initHeader.catalog.defaultCatalogData.options.dataFilePrefix, 'defaultCatalogData');
    assert.deepStrictEqual(Object.values(initData).map(record => record.code).sort(), [
        'defaultContentCatalog',
        'defaultProductCatalog'
    ]);

    assert.strictEqual(sampleHeader.catalog.defaultSamplesCatalog.options.schemaName, 'catalog');
    assert.strictEqual(sampleHeader.catalog.defaultSamplesCatalog.options.dataFilePrefix, 'defaultSamplesCatalogData');
    assert.deepStrictEqual(sampleData.record0.subCatalogs, ['inProductCatalog', 'uaeProductCatalog', 'deProductCatalog']);
    assert.deepStrictEqual(sampleData.record1.subCatalogs, ['inContentCatalog', 'uaeContentCatalog', 'deContentCatalog']);

    const request = {
        tenant: 'default',
        authData: { code: 'catalogAdmin' },
        options: { recursive: true, projection: ['code'] }
    };
    const models = [{ code: 'defaultProductCatalog' }, { code: 'defaultContentCatalog' }];
    await resolver.loadSubCatalogs(request, { success: { result: models } });

    assert.deepStrictEqual(models[0].subCatalogs, [{ code: 'inProductCatalog' }, { code: 'uaeProductCatalog' }]);
    assert.strictEqual(models[1].subCatalogs, undefined);
    assert.strictEqual(calls.length, 2);
    assert.deepStrictEqual(calls.map(call => call.query), [{
        superCatalog: 'defaultProductCatalog',
        active: true
    }, {
        superCatalog: 'defaultContentCatalog',
        active: true
    }]);
    assert.deepStrictEqual(calls[0].options, { recursive: false, projection: ['code'] });
    assert.strictEqual(request.options.recursive, true);

    await resolver.fatchSubCatalog(request, []);

    console.log('Catalog capability contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
