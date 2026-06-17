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

global.SERVICE = {
    DefaultPipelineService: {
        start: function (pipelineName, request, response) {
            calls.push({ pipelineName, request, response });
            return Promise.resolve({ pipelineName, request, response });
        }
    }
};

const service = require('../src/service/indexer/defaultIndexerService');

async function assertIndexerFailure(result, expectedCode) {
    service.get = function () {
        return Promise.resolve(result);
    };

    await assert.rejects(() => service.prepareIndexer({
        tenant: 'tenantA',
        indexName: 'enterprise',
        indexerCode: 'EnterpriseDataIndexer'
    }), (error) => {
        assert.strictEqual(error.code, expectedCode);
        return true;
    });
}

(async function run() {
    service.get = function (request) {
        calls.push({ operation: 'get', request });
        return Promise.resolve({
            result: [{
                code: 'EnterpriseDataIndexer',
                target: {
                    indexName: 'enterprise'
                }
            }]
        });
    };

    const request = {
        tenant: 'tenantA',
        indexName: 'enterprise',
        indexerCode: 'EnterpriseDataIndexer'
    };
    const response = await service.prepareIndexer(request);

    assert.strictEqual(calls[0].operation, 'get');
    assert.deepStrictEqual(calls[0].request.query, { code: 'EnterpriseDataIndexer' });
    assert.strictEqual(calls[1].pipelineName, 'indexerInitializerPipeline');
    assert.strictEqual(request.indexerConfig.code, 'EnterpriseDataIndexer');
    assert.strictEqual(response.pipelineName, 'indexerInitializerPipeline');

    await assertIndexerFailure({ result: [{ target: { indexName: 'other' } }] }, 'ERR_SRCH_00011');
    await assertIndexerFailure({ result: [{ target: { indexName: 'enterprise' } }, { target: { indexName: 'enterprise' } }] }, 'ERR_SRCH_00012');
    await assertIndexerFailure({ result: [] }, 'ERR_SRCH_00013');

    console.log('Search indexer service contract validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
