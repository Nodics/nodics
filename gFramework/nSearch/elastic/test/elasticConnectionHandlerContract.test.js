/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nSearch/elastic/test/elasticConnectionHandlerContract
 * @description Verifies the Elastic connection handler registers provider model definitions and reads cluster index metadata through the configured engine connection.
 * @layer test
 * @owner nSearch/elastic
 * @override Project search providers may use their own connection handler, but must publish raw model definitions and index metadata through nSearch configuration services.
 */

const assert = require('assert');

global.CLASSES = {
    SearchError: class SearchError extends Error {
        constructor(error, message, code) {
            super(message || error && error.message || String(error));
            this.code = code || (typeof error === 'string' ? error : error && error.code);
        }
    }
};

const loadedPaths = [];
const rawDefinitions = [];

global.SERVICE = {
    DefaultFilesLoaderService: {
        loadFiles: function (path, target) {
            loadedPaths.push(path);
            target.default = { marker: 'elastic-definition' };
        }
    },
    DefaultSearchConfigurationService: {
        addRawSearchModelDefinition: function (engine, definition) {
            rawDefinitions.push({ engine, definition });
        }
    }
};

const service = Object.assign({}, require('../src/service/connection/defaultElasticSearchEngineConnectionHandlerService'), {
    LOG: {
        debug: function () {}
    }
});

(async function run() {
    service.loadRawSearchModelDefinition();

    assert.deepStrictEqual(loadedPaths, ['/src/schemas/elasticSearchModel.js']);
    assert.strictEqual(rawDefinitions.length, 1);
    assert.strictEqual(rawDefinitions[0].engine, 'elastic');
    assert.deepStrictEqual(rawDefinitions[0].definition.default, { marker: 'elastic-definition' });

    const stateCalls = [];
    const indexes = await service.getIndexes({
        getConnection: function () {
            return {
                cluster: {
                    state: function (query, callback) {
                        stateCalls.push(query);
                        callback(null, {
                            metadata: {
                                indices: {
                                    enterprise: { aliases: {} },
                                    product: { aliases: {} }
                                }
                            }
                        });
                    }
                }
            };
        }
    });

    assert.deepStrictEqual(stateCalls, [{}]);
    assert.deepStrictEqual(Object.keys(indexes).sort(), ['enterprise', 'product']);

    await assert.rejects(() => service.getIndexes({
        getConnection: function () {
            return {
                cluster: {
                    state: function (query, callback) {
                        callback(new Error('cluster unavailable'));
                    }
                }
            };
        }
    }), error => {
        assert.strictEqual(error.code, 'ERR_SRCH_00000');
        return true;
    });

    console.log('Elastic connection handler contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
