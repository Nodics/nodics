/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nSearch/elastic/test/elasticSearchModelOperationContract
 * @description Verifies the Elastic search model implementation maps Nodics search operations to the expected engine client APIs and normalized query payloads.
 * @layer test
 * @owner nSearch/elastic
 * @override Project search providers may replace Elastic, but must preserve the nSearch model operation contract for health, indexing, refresh, lookup, search, delete, schema, and index lifecycle behavior.
 */

const assert = require('assert');

const elasticDefinitions = require('../src/schemas/elasticSearchModel').default;

function createSearchModel(responseByOperation = {}) {
    const calls = [];
    const connection = {};
    const operationNames = [
        'exists',
        'get',
        'search',
        'index',
        'bulk',
        'update',
        'delete',
        'deleteByQuery'
    ];

    operationNames.forEach(operation => {
        connection[operation] = function (query, callback) {
            calls.push({ operation, query });
            callback(null, responseByOperation[operation] || { operation, acknowledged: true });
        };
    });

    connection.cluster = {
        health: function (query, callback) {
            calls.push({ operation: 'cluster.health', query });
            callback(null, responseByOperation.health || { status: 'green' });
        }
    };
    connection.indices = {
        create: function (query, callback) {
            calls.push({ operation: 'indices.create', query });
            callback(null, responseByOperation.create || { acknowledged: true });
        },
        refresh: function (query, callback) {
            calls.push({ operation: 'indices.refresh', query });
            callback(null, responseByOperation.refresh || { refreshed: true });
        },
        getMapping: function (query, callback) {
            calls.push({ operation: 'indices.getMapping', query });
            callback(null, responseByOperation.getMapping || { mapping: true });
        },
        putMapping: function (query, callback) {
            calls.push({ operation: 'indices.putMapping', query });
            callback(null, responseByOperation.putMapping || { acknowledged: true });
        },
        delete: function (query, callback) {
            calls.push({ operation: 'indices.delete', query });
            callback(null, responseByOperation.deleteIndex || { acknowledged: true });
        }
    };

    const searchModel = {
        LOG: {
            debug: function () {}
        },
        indexDef: {
            indexName: 'EnterpriseIndex',
            typeName: 'EnterpriseType',
            idPropertyName: 'code'
        },
        searchEngine: {
            getOptions: function () {
                return {
                    refreshOptions: { refreshBase: true },
                    healthOptions: { level: 'indices' },
                    existsOptions: { realtime: true },
                    getOptions: { stored_fields: ['code'] },
                    searchOptions: { size: 10 },
                    saveOptions: { refresh: 'wait_for' },
                    bulkOptions: { refresh: false },
                    updateOptions: { retry_on_conflict: 1 },
                    removeOptions: { refresh: true },
                    schemaGetOptions: { include_type_name: true },
                    schemaPutOptions: { timeout: '30s' },
                    removeIndexOptions: { ignore_unavailable: true },
                    createIndexOptions: { wait_for_active_shards: 1 }
                };
            },
            getConnection: function () {
                return connection;
            }
        }
    };

    Object.keys(elasticDefinitions)
        .filter(key => key.indexOf('defineDefault') === 0)
        .forEach(key => elasticDefinitions[key](searchModel));

    return { searchModel, calls };
}

async function assertOperation(operation, input, expectedClientOperation, expectedQuery, expectedResult) {
    const context = createSearchModel(operation === 'doExists' ? { exists: true } : {});
    const result = await context.searchModel[operation](input);
    assert.strictEqual(context.calls.length, 1, `${operation} should make one engine call`);
    assert.strictEqual(context.calls[0].operation, expectedClientOperation);
    assert.deepStrictEqual(context.calls[0].query, expectedQuery);
    if (expectedResult) {
        assert.deepStrictEqual(result, expectedResult);
    }
}

(async function run() {
    await assertOperation('doCreateIndex', {
        options: { master_timeout: '30s' }
    }, 'indices.create', {
        wait_for_active_shards: 1,
        master_timeout: '30s',
        index: 'enterpriseindex'
    });

    await assertOperation('doRefresh', {
        options: { refreshExtra: true }
    }, 'indices.refresh', {
        refreshBase: true,
        refreshExtra: true,
        index: 'enterpriseindex'
    });

    await assertOperation('doCheckHealth', {
        options: { wait_for_status: 'yellow' }
    }, 'cluster.health', {
        level: 'indices',
        wait_for_status: 'yellow',
        index: 'enterpriseindex'
    }, { status: 'green' });

    await assertOperation('doExists', {
        query: { id: 'ENT-1' },
        options: { preference: '_local' }
    }, 'exists', {
        realtime: true,
        preference: '_local',
        index: 'enterpriseindex',
        type: 'enterprisetype',
        id: 'ENT-1'
    }, { available: true });

    await assertOperation('doGet', {
        query: { id: 'ENT-1' },
        options: { routing: 'tenant-a' }
    }, 'get', {
        stored_fields: ['code'],
        routing: 'tenant-a',
        index: 'enterpriseindex',
        type: 'enterprisetype',
        id: 'ENT-1'
    });

    await assertOperation('doSearch', {
        q: 'code:ENT-1',
        options: { from: 2 }
    }, 'search', {
        size: 10,
        from: 2,
        index: 'enterpriseindex',
        type: 'enterprisetype',
        q: 'code:ENT-1'
    });

    await assertOperation('doSearch', {
        query: { match: { code: 'ENT-1' } }
    }, 'search', {
        size: 10,
        index: 'enterpriseindex',
        type: 'enterprisetype',
        body: {
            query: { match: { code: 'ENT-1' } }
        }
    });

    await assertOperation('doSave', {
        model: { code: 'ENT-1', name: 'Enterprise One' }
    }, 'index', {
        refresh: 'wait_for',
        index: 'enterpriseindex',
        type: 'enterprisetype',
        body: { code: 'ENT-1', name: 'Enterprise One' },
        id: 'ENT-1'
    });

    await assertOperation('doBulk', {
        models: [{ index: { _id: 'ENT-1' } }, { code: 'ENT-1' }],
        options: { refresh: true }
    }, 'bulk', {
        refresh: true,
        body: [{ index: { _id: 'ENT-1' } }, { code: 'ENT-1' }]
    });

    await assertOperation('doUpdate', {
        data: { doc: { name: 'Updated' } },
        options: { id: 'ENT-1' }
    }, 'update', {
        retry_on_conflict: 1,
        id: 'ENT-1',
        body: { doc: { name: 'Updated' } }
    });

    await assertOperation('doRemove', {
        query: { id: 'ENT-1' }
    }, 'delete', {
        refresh: true,
        index: 'enterpriseindex',
        type: 'enterprisetype',
        id: 'ENT-1'
    });

    await assertOperation('doRemoveByQuery', {
        query: { term: { active: false } }
    }, 'deleteByQuery', {
        refresh: true,
        index: 'enterpriseindex',
        type: 'enterprisetype',
        body: {
            query: { term: { active: false } }
        }
    });

    await assertOperation('doGetSchema', {}, 'indices.getMapping', {
        include_type_name: true,
        index: 'enterpriseindex',
        type: 'enterprisetype'
    });

    await assertOperation('doUpdateSchema', {
        searchSchema: { properties: { code: { type: 'keyword' } } }
    }, 'indices.putMapping', {
        timeout: '30s',
        index: 'enterpriseindex',
        type: 'enterprisetype',
        body: { properties: { code: { type: 'keyword' } } }
    });

    await assertOperation('doRemoveIndex', {}, 'indices.delete', {
        ignore_unavailable: true,
        index: 'enterpriseindex'
    });

    console.log('Elastic search model operation contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
