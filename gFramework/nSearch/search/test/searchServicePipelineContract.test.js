/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

const calls = [];

global.CLASSES = {
    SearchError: class SearchError extends Error {
        constructor(error, message) {
            super(message || (error && error.message) || error);
            this.code = typeof error === 'string' ? error : error && error.code;
        }
    }
};

global.NODICS = {
    getModels: function () {
        return {
            mdlnm: {
                indexName: 'enterprise'
            }
        };
    },
    getSearchModel: function (moduleName, tenant, indexName) {
        return {
            moduleName,
            tenant,
            indexName,
            indexDef: {}
        };
    }
};

global.SERVICE = {
    DefaultPipelineService: {
        start: function (pipelineName, request, response) {
            calls.push({ pipelineName, request, response });
            return Promise.resolve({ pipelineName, request, response });
        }
    },
    DefaultIndexerService: {
        prepareIndexer: function (request) {
            calls.push({ pipelineName: 'prepareIndexer', request });
            return Promise.resolve({ pipelineName: 'prepareIndexer', request });
        }
    }
};

const service = require('../src/service/common');

async function assertPipeline(operation, expectedPipeline) {
    calls.length = 0;
    const request = {
        tenant: 'tenantA',
        moduleName: 'profile',
        indexName: 'enterprise'
    };

    const result = await service[operation](request);

    assert.strictEqual(calls.length, 1, `${operation} should dispatch once`);
    assert.strictEqual(calls[0].pipelineName, expectedPipeline);
    assert.strictEqual(calls[0].request, request);
    assert.strictEqual(request.searchModel.indexName, 'enterprise');
    assert.strictEqual(result.pipelineName, expectedPipeline);
}

(async function run() {
    await assertPipeline('doRefresh', 'doRefreshIndexInitializerPipeline');
    await assertPipeline('doCheckHealth', 'doHealthCheckClusterInitializerPipeline');
    await assertPipeline('doExists', 'doExistModelInitializerPipeline');
    await assertPipeline('doGet', 'doGetModelsInitializerPipeline');
    await assertPipeline('doSearch', 'doSearchModelInitializerPipeline');
    await assertPipeline('doSave', 'doSaveModelsInitializerPipeline');
    await assertPipeline('doBulk', 'doBulkModelInitializerPipeline');
    await assertPipeline('doRemove', 'doRemoveModelsInitializerPipeline');
    await assertPipeline('doRemoveByQuery', 'doRemoveModelsByQueryInitializerPipeline');
    await assertPipeline('doGetSchema', 'doGetSchemaModelInitializerPipeline');
    await assertPipeline('doUpdateSchema', 'doUpdateSchemaModelInitializerPipeline');
    await assertPipeline('doRemoveIndex', 'doRemoveIndexInitializerPipeline');
    await assertPipeline('doIndexing', 'prepareIndexer');

    await assert.rejects(() => service.doSearch({ moduleName: 'profile' }), global.CLASSES.SearchError);

    console.log('Search service pipeline contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
