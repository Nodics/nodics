const assert = require('assert');

const calls = [];

global.FACADE = {
    dsdName: {}
};

[
    'doRefresh',
    'doCheckHealth',
    'doExists',
    'doGet',
    'doSearch',
    'doSave',
    'doBulk',
    'doRemove',
    'doRemoveByQuery',
    'doGetSchema',
    'doUpdateSchema',
    'doRemoveIndex',
    'doIndexing'
].forEach((operation) => {
    global.FACADE.dsdName[operation] = function (request) {
        calls.push({ operation, request });
        return Promise.resolve({ code: 'SUC_' + operation });
    };
});

function httpRequest(body, params) {
    return {
        body: body || {},
        params: params || {}
    };
}

const controller = require('../src/controller/common');

async function assertOperation(operation, body, params, expected) {
    calls.length = 0;
    const request = {
        tenant: 'tenantA',
        moduleName: 'profile',
        httpRequest: httpRequest(body, params)
    };

    const response = await controller[operation](request);

    assert.strictEqual(response.code, 'SUC_' + operation);
    assert.strictEqual(calls.length, 1, `${operation} should call facade`);
    assert.strictEqual(calls[0].operation, operation);
    Object.keys(expected || {}).forEach((field) => {
        assert.deepStrictEqual(calls[0].request[field], expected[field], `${operation} should map ${field}`);
    });
}

(async function run() {
    await assertOperation('doRefresh', { options: { wait: true } }, { indexName: 'enterprise' }, {
        indexName: 'enterprise',
        options: { wait: true }
    });
    await assertOperation('doCheckHealth', {}, { indexName: 'enterprise' }, {
        indexName: 'enterprise'
    });
    await assertOperation('doExists', {}, { indexName: 'enterprise', id: 'ent01' }, {
        indexName: 'enterprise',
        query: { id: 'ent01' }
    });
    await assertOperation('doGet', {}, { indexName: 'enterprise', id: 'ent01' }, {
        indexName: 'enterprise',
        query: { id: 'ent01' }
    });
    await assertOperation('doSearch', {}, { indexName: 'enterprise', id: 'ent01' }, {
        indexName: 'enterprise',
        query: { match: { _id: 'ent01' } }
    });
    await assertOperation('doSave', { model: { code: 'ent01' } }, { indexName: 'enterprise' }, {
        indexName: 'enterprise',
        model: { code: 'ent01' }
    });
    await assertOperation('doBulk', { models: [{ code: 'ent01' }] }, { indexName: 'enterprise' }, {
        indexName: 'enterprise',
        models: [{ code: 'ent01' }]
    });
    await assertOperation('doRemove', {}, { indexName: 'enterprise', id: 'ent01' }, {
        indexName: 'enterprise',
        query: { id: 'ent01' }
    });
    await assertOperation('doRemoveByQuery', { query: { active: false } }, { indexName: 'enterprise' }, {
        indexName: 'enterprise',
        query: { active: false }
    });
    await assertOperation('doGetSchema', {}, { indexName: 'enterprise' }, {
        indexName: 'enterprise'
    });
    await assertOperation('doUpdateSchema', { schema: { properties: {} } }, { indexName: 'enterprise' }, {
        indexName: 'enterprise',
        schema: { properties: {} }
    });
    await assertOperation('doRemoveIndex', {}, { indexName: 'enterprise' }, {
        indexName: 'enterprise'
    });
    await assertOperation('doIndexing', {}, { indexName: 'enterprise', indexerCode: 'EnterpriseDataIndexer' }, {
        indexName: 'enterprise',
        indexerCode: 'EnterpriseDataIndexer'
    });

    console.log('Search controller request mapping validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
