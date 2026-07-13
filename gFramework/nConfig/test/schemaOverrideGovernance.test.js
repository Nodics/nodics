/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module config/test/schemaOverrideGovernance
 * @description Verifies additive and replacement schema merging across ordered module layers, including property removal, type-change warnings, and contribution trace metadata.
 * @layer test
 * @owner nConfig
 * @override Project modules may add schema-specific scenarios while preserving generic layered schema governance.
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-schema-override-'));
const baseModulePath = path.join(rootDir, 'baseModule');
const appModulePath = path.join(rootDir, 'appModule');
const replaceModulePath = path.join(rootDir, 'replaceModule');

function writeSchemaFile(modulePath, schemaFile) {
    let schemaDirectory = path.join(modulePath, 'src', 'schemas');
    fs.mkdirSync(schemaDirectory, { recursive: true });
    fs.writeFileSync(path.join(schemaDirectory, 'schemas.js'), schemaFile, 'utf8');
}

writeSchemaFile(baseModulePath, `
module.exports = {
    catalog: {
        catalog: {
            model: true,
            definition: {
                code: {
                    type: 'string',
                    required: true
                },
                name: {
                    type: 'string'
                }
            }
        }
    }
};
`);

writeSchemaFile(appModulePath, `
module.exports = {
    catalog: {
        catalog: {
            definition: {
                seoCode: {
                    type: 'string'
                },
                name: {
                    type: 'object'
                }
            },
            $override: {
                removeProperties: ['code']
            }
        }
    }
};
`);

writeSchemaFile(replaceModulePath, `
module.exports = {
    catalog: {
        catalog: {
            router: {
                enabled: true
            },
            definition: {
                replacementOnly: {
                    type: 'boolean'
                }
            },
            $override: {
                mode: 'replace',
                allowBreakingChanges: true
            }
        }
    }
};
`);

global.NODICS = {
    /** @returns {string} Temporary Nodics home containing test module fixtures. */
    getNodicsHome: function () {
        return rootDir;
    },
    /** @returns {Map<string,Object>} Ordered base and project module fixtures. */
    getIndexedModules: function () {
        return new Map([
            ['1.0', { name: 'baseModule', path: baseModulePath }],
            ['2.0', { name: 'appModule', path: appModulePath }]
        ]);
    }
};

global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(code, message) {
            super(message || code);
            this.code = code;
        }
    }
};

const loader = require('../src/service/defaultFilesLoaderService');
let warnings = [];
loader.LOG = {
    /** @returns {void} Ignores debug output during the isolated test. */
    debug: function () {},
    /** @param {string} message Governance warning to capture. @returns {void} */
    warn: function (message) {
        warnings.push(message);
    }
};

let mergedSchema = loader.loadSchemaFiles('/src/schemas/schemas.js', null);
assert.strictEqual(mergedSchema.catalog.catalog.definition.code, undefined);
assert.strictEqual(mergedSchema.catalog.catalog.definition.seoCode.type, 'string');
assert.strictEqual(mergedSchema.catalog.catalog.definition.name.type, 'object');
assert.strictEqual(mergedSchema.catalog.catalog.model, true);
assert.strictEqual(warnings.length, 1);
assert(warnings[0].includes('property type changed: name'));
assert(warnings[0].includes('properties removed: code'));
assert.strictEqual(mergedSchema.catalog.catalog.xNodics.overrideTrace.length, 2);
assert.strictEqual(mergedSchema.catalog.catalog.xNodics.overrideTrace[1].sourceModule, 'appModule');
assert.deepStrictEqual(mergedSchema.catalog.catalog.xNodics.overrideTrace[1].removedProperties, ['code']);

global.NODICS.getIndexedModules = function () {
    return new Map([
        ['1.0', { name: 'baseModule', path: baseModulePath }],
        ['3.0', { name: 'replaceModule', path: replaceModulePath }]
    ]);
};
warnings = [];

let replacedSchema = loader.loadSchemaFiles('/src/schemas/schemas.js', null);
assert.strictEqual(replacedSchema.catalog.catalog.definition.code, undefined);
assert.strictEqual(replacedSchema.catalog.catalog.definition.replacementOnly.type, 'boolean');
assert.strictEqual(replacedSchema.catalog.catalog.router.enabled, true);
assert.strictEqual(replacedSchema.catalog.catalog.model, undefined);
assert.strictEqual(warnings.length, 0);
assert.strictEqual(replacedSchema.catalog.catalog.xNodics.overrideTrace.length, 1);
assert.strictEqual(replacedSchema.catalog.catalog.xNodics.overrideTrace[0].mode, 'replace');

fs.rmSync(rootDir, { recursive: true, force: true });
console.log('Schema override governance validated');
