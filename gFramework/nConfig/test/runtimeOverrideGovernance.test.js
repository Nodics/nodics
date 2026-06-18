/**
 * @module config/test/runtimeOverrideGovernance
 * @description Verifies that persisted runtime schema and router contributions obey the same additive, replacement, removal, warning, and traceability rules as file-based module layers.
 * @layer test
 * @owner nConfig
 * @override Project modules may add runtime override scenarios, but must preserve explicit breaking-change governance and source trace metadata.
 */
const assert = require('assert');

global.NODICS = {
    getNodicsHome: function () {
        return '/nodics';
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
    debug: function () {},
    warn: function (message) {
        warnings.push(message);
    }
};

let schema = loader.mergeRuntimeSchemaFiles({
    profile: {
        tenant: {
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
}, {
    profile: {
        tenant: {
            definition: {
                name: {
                    type: 'object'
                },
                displayName: {
                    type: 'string'
                }
            },
            $override: {
                removeProperties: ['code']
            }
        }
    }
}, 'controlPlane', 'runtime:schemaConfiguration');

assert.strictEqual(schema.profile.tenant.definition.code, undefined);
assert.strictEqual(schema.profile.tenant.definition.name.type, 'object');
assert.strictEqual(schema.profile.tenant.definition.displayName.type, 'string');
assert.strictEqual(schema.profile.tenant.xNodics.overrideTrace.length, 1);
assert.strictEqual(schema.profile.tenant.xNodics.overrideTrace[0].sourceModule, 'controlPlane');
assert.strictEqual(schema.profile.tenant.xNodics.overrideTrace[0].source, 'runtime:schemaConfiguration');
assert(warnings[0].includes('property type changed: name'));

warnings = [];
let routers = loader.mergeRuntimeRouterFiles({
    profile: {
        users: {
            getUser: {
                key: '/users/:id',
                method: 'GET',
                controller: 'DefaultUserController',
                operation: 'getUser',
                secured: true
            }
        }
    }
}, {
    profile: {
        users: {
            getUser: {
                controller: 'RuntimeUserController',
                operation: 'getRuntimeUser',
                $override: {
                    allowBreakingChanges: true
                }
            }
        }
    }
}, 'controlPlane', 'runtime:routerConfiguration');

assert.strictEqual(routers.profile.users.getUser.key, '/users/:id');
assert.strictEqual(routers.profile.users.getUser.controller, 'RuntimeUserController');
assert.strictEqual(routers.profile.users.getUser.operation, 'getRuntimeUser');
assert.strictEqual(routers.profile.users.getUser.xNodics.overrideTrace.length, 1);
assert.strictEqual(routers.profile.users.getUser.xNodics.overrideTrace[0].source, 'runtime:routerConfiguration');
assert.strictEqual(Object.keys(routers.profile.users).includes('xNodics'), false);
assert.strictEqual(warnings.length, 0);

console.log('Runtime override governance validated');
