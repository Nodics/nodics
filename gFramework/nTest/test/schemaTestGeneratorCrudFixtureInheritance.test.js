/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
    DefaultDatabaseConfigurationService: {
        getRawSchema: function () {
            return {
                default: {
                    base: {
                        definition: {
                            code: {
                                type: 'string',
                                required: true
                            }
                        }
                    }
                },
                profile: {
                    user: {
                        super: 'base',
                        refSchema: {
                            password: {
                                enabled: true,
                                schemaName: 'password',
                                type: 'one',
                                propertyName: '_id'
                            },
                            userGroups: {
                                enabled: true,
                                schemaName: 'userGroup',
                                type: 'many',
                                propertyName: 'code'
                            }
                        },
                        definition: {
                            name: {
                                type: 'object',
                                required: true
                            },
                            'name.firstName': {
                                type: 'string',
                                required: true
                            },
                            'name.lastName': {
                                type: 'string',
                                required: true
                            },
                            loginId: {
                                type: 'string',
                                required: true
                            },
                            password: {
                                type: 'objectId',
                                required: true
                            },
                            userGroups: {
                                type: 'array',
                                required: true
                            },
                            created: {
                                type: 'date',
                                required: true,
                                default: 'DefaultPropertyInitialValueProviderService.getCurrentTimestamp'
                            }
                        }
                    },
                    customer: {
                        super: 'user',
                        model: true,
                        service: {
                            enabled: true
                        },
                        router: {
                            enabled: true
                        },
                        definition: {}
                    }
                }
            };
        }
    }
};

const generator = require('../src/service/generator/defaultSchemaTestGeneratorService');
const effectiveSchemas = generator.resolveModuleSchemasForGeneration('profile', SERVICE.DefaultDatabaseConfigurationService.getRawSchema().profile);
const fixture = generator.createCrudModelFixture('customer', effectiveSchemas.customer, 'create');

assert.strictEqual(fixture.code, 'ntest_customer_<runId>');
assert.strictEqual(fixture.active, true);
assert(fixture.name, 'Inherited object property should be present');
assert.strictEqual(fixture.name.firstName, 'ntest_name.firstName_<runId>');
assert.strictEqual(fixture.name.lastName, 'ntest_name.lastName_<runId>');
assert.strictEqual(fixture.loginId, 'ntest_loginId_<runId>');
assert.deepStrictEqual(fixture.userGroups, ['userGroup']);
assert(fixture.password, 'Inherited one-reference fixture should be present');
assert.strictEqual(fixture.password.loginId, 'ntest_customer_<runId>');
assert.strictEqual(fixture.password.password, 'nodics');
assert(!Object.prototype.hasOwnProperty.call(fixture, 'name.firstName'), 'Nested path should not be emitted as a literal property');
assert(!Object.prototype.hasOwnProperty.call(fixture, 'created'), 'Defaulted properties should be omitted so runtime default providers own the value');

console.log('Schema test generator CRUD fixture inheritance validated');
