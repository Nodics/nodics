/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module test/SchemaTestGeneratorEffectiveOverrideRemoval
 * @description Proves generated CRUD scenario tests use the effective project
 * schema contract when a later layer removes a default framework property.
 * @layer test
 * @owner nTest
 * @override Project modules may add equivalent generator tests for custom schema
 * removal, field masking, validation, or fixture contracts.
 */

const assert = require('assert');

// @nodics-capability-behavior @nodics-area testing
if (!String.prototype.toUpperCaseEachWord) {
    String.prototype.toUpperCaseEachWord = function () {
        return String(this).replace(/(^|_)([a-z])/g, function (match, prefix, character) {
            return character.toUpperCase();
        });
    };
}

global.UTILS = {
    getCopywriteComment: function () {
        return '';
    },
    isBlank: function (value) {
        return value === undefined || value === null || value === '' ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'object' && Object.keys(value).length === 0);
    }
};

global.NODICS = {};
global.SERVICE = {
    DefaultFilesLoaderService: {
        loadRouterFiles: function () {
            return {
                default: {
                    crud: {
                        save: {
                            key: '/schemaName',
                            method: 'put',
                            controller: 'DefaultctrlName',
                            operation: 'save',
                            secured: true
                        },
                        update: {
                            key: '/schemaName',
                            method: 'patch',
                            controller: 'DefaultctrlName',
                            operation: 'update',
                            secured: true
                        },
                        getByCode: {
                            key: '/schemaName/:code',
                            method: 'get',
                            controller: 'DefaultctrlName',
                            operation: 'get',
                            secured: true
                        },
                        removeByCode: {
                            key: '/schemaName/:code',
                            method: 'delete',
                            controller: 'DefaultctrlName',
                            operation: 'removeByCode',
                            secured: true
                        }
                    }
                }
            };
        }
    }
};

const generator = require('../src/service/generator/defaultSchemaTestGeneratorService');

const defaultFrameworkSchema = {
    model: true,
    service: {
        enabled: true
    },
    router: {
        enabled: true,
        alias: 'cartPreference'
    },
    definition: {
        code: {
            type: 'string',
            required: true
        },
        displayName: {
            type: 'string',
            required: true
        },
        internalAuditNote: {
            type: 'string',
            required: true
        }
    }
};

const effectiveProjectSchema = {
    model: true,
    service: {
        enabled: true
    },
    router: {
        enabled: true,
        alias: 'cartPreference'
    },
    definition: {
        code: {
            type: 'string',
            required: true
        },
        displayName: {
            type: 'string',
            required: true
        }
    }
};

const generatedContent = generator.createSchemaCrudScenarioTestContent({
    moduleName: 'cart',
    moduleObject: {
        metaData: {
            name: 'cart',
            prefix: 'cart'
        }
    },
    schemaName: 'cartPreference',
    schemaObject: defaultFrameworkSchema,
    effectiveSchemaObject: effectiveProjectSchema
});

const expectedMatch = generatedContent.match(/const expected = ([\s\S]*?);\n\nassert/);
assert(expectedMatch, 'Generated CRUD scenario test must include expected contract data');

const expected = JSON.parse(expectedMatch[1]);
const createScenario = expected.scenarios.find(scenario => scenario.operation === 'save');
const updateScenario = expected.scenarios.find(scenario => scenario.operation === 'update');

assert(createScenario, 'Generated CRUD scenarios must include save coverage');
assert(updateScenario, 'Generated CRUD scenarios must include update coverage');
assert.strictEqual(createScenario.request.body.code, 'ntest_cartpreference_<runId>');
assert.strictEqual(createScenario.request.body.displayName, 'ntest_displayName_<runId>');
assert.strictEqual(updateScenario.request.body.model.displayName, 'ntest_displayName_<runId>');
assert(!Object.prototype.hasOwnProperty.call(createScenario.request.body, 'internalAuditNote'),
    'Removed project property must not be generated into create fixture');
assert(!Object.prototype.hasOwnProperty.call(updateScenario.request.body.model, 'internalAuditNote'),
    'Removed project property must not be generated into update fixture');
assert(!generatedContent.includes('ntest_internalAuditNote_<runId>'),
    'Generated CRUD content must not include removed property fixture values');

console.log('Schema test generator effective override removal validated');
