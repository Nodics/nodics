/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

// @nodics-capability-behavior @nodics-area system
const calls = [];
global.FACADE = {
    DefaultSchemaIndexFacade: {
        updateModulesIndexes: function () {
            calls.push({ operation: 'updateModulesIndexes' });
            return Promise.resolve({ code: 'SUC_INDEX_ALL' });
        },
        updateSchemaIndexes: function (moduleName, schemaName) {
            calls.push({ operation: 'updateSchemaIndexes', moduleName, schemaName });
            return Promise.resolve({ code: 'SUC_INDEX_SCHEMA' });
        },
        updateModuleIndexes: function (moduleName) {
            calls.push({ operation: 'updateModuleIndexes', moduleName });
            return Promise.resolve({ code: 'SUC_INDEX_MODULE' });
        }
    }
};

const controller = require('../src/controller/schema/defaultSchemaIndexController');

(async function () {
    let allResponse = await controller.updateModulesIndexes({});
    assert.strictEqual(allResponse.code, 'SUC_INDEX_ALL');

    let schemaResponse = await controller.updateSchemaIndexes({
        moduleName: 'profile',
        httpRequest: {
            params: {
                schema: 'tenant'
            }
        }
    });
    assert.strictEqual(schemaResponse.code, 'SUC_INDEX_SCHEMA');

    assert.deepStrictEqual(calls, [{
        operation: 'updateModulesIndexes'
    }, {
        operation: 'updateSchemaIndexes',
        moduleName: 'profile',
        schemaName: 'tenant'
    }]);

    console.log('System schema index controller request mapping validated');
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
