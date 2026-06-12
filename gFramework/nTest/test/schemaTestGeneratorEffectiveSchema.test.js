const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

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
    },
    removeDir: function (dirPath) {
        fs.rmSync(dirPath, { recursive: true, force: true });
    }
};

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-generated-schema-test-'));
const profileModulePath = path.join(tempRoot, 'profile');
const projectModulePath = path.join(tempRoot, 'kickoffLocal');
fs.mkdirSync(profileModulePath, { recursive: true });
fs.mkdirSync(projectModulePath, { recursive: true });

global.NODICS = {
    getModule: function (moduleName) {
        if (moduleName === 'profile') {
            return {
                path: profileModulePath,
                metaData: {
                    name: 'profile',
                    prefix: 'profile'
                }
            };
        }
        if (moduleName === 'kickoffLocal') {
            return {
                path: projectModulePath,
                metaData: {
                    name: 'kickoffLocal',
                    prefix: 'kickoffLocal'
                }
            };
        }
        return undefined;
    }
};

global.SERVICE = {
    DefaultDatabaseConfigurationService: {
        getRawSchema: function () {
            return {
                profile: {
                    tenant: {
                        model: true,
                        service: {
                            enabled: true
                        },
                        router: {
                            enabled: false
                        },
                        properties: {
                            projectSpecificProperty: {
                                type: 'string'
                            }
                        }
                    }
                }
            };
        }
    }
};

const generator = require('../src/service/generator/defaultSchemaTestGeneratorService');

generator.buildGeneratedTests().then(() => {
    const generatedProfileTest = path.join(profileModulePath, 'test', 'gen', 'schema', 'tenantSchemaContract.test.js');
    const generatedProjectTest = path.join(projectModulePath, 'test', 'gen', 'schema', 'tenantSchemaContract.test.js');

    assert(fs.existsSync(generatedProfileTest), 'Effective profile.tenant schema test should be generated under profile module');
    assert(!fs.existsSync(generatedProjectTest), 'Logical profile schema test should not be generated under the physical project module');

    const generatedContent = fs.readFileSync(generatedProfileTest, 'utf8');
    assert(generatedContent.includes('"moduleName": "profile"'));
    assert(generatedContent.includes('"schemaName": "tenant"'));

    fs.rmSync(tempRoot, { recursive: true, force: true });
    console.log('Schema test generator effective schema ownership validated');
}).catch(error => {
    fs.rmSync(tempRoot, { recursive: true, force: true });
    throw error;
});
