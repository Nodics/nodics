const assert = require('assert');

global.CONFIG = {
    get: function () {
        return 'default';
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

global.NODICS = {
    getModule: function () {
        return {
            rawSchema: {
                tenant: {
                    code: 'tenant',
                    moduleName: 'profile',
                    model: true,
                    service: {
                        enabled: true
                    },
                    router: {
                        enabled: true
                    },
                    definition: {
                        code: {
                            type: 'string',
                            required: true
                        },
                        displayName: {
                            type: 'string'
                        }
                    }
                }
            }
        };
    }
};

let rawRouters = {
    profile: {
        users: {
            runtimeUser: {
                code: 'runtimeUser',
                moduleName: 'profile',
                groupName: 'users',
                key: '/old/users/:id',
                method: 'GET',
                controller: 'OldUserController',
                operation: 'getUser',
                secured: true
            }
        }
    }
};

global.SERVICE = {
    DefaultFilesLoaderService: require('../../nConfig/src/service/defaultFilesLoaderService'),
    DefaultSchemaConfigurationService: {
        get: function () {
            return Promise.resolve({
                result: [{
                    code: 'tenant',
                    moduleName: 'profile',
                    $override: {
                        removeProperties: ['displayName']
                    },
                    definition: {
                        code: {
                            type: 'number',
                            required: true
                        }
                    }
                }]
            });
        }
    },
    DefaultRouterConfigurationService: {
        getRawRouters: function () {
            return rawRouters;
        },
        get: function () {
            return Promise.resolve({
                result: [{
                    code: 'runtimeUser',
                    moduleName: 'profile',
                    groupName: 'users',
                    key: '/new/users/:id',
                    method: 'POST',
                    controller: 'RuntimeUserController',
                    operation: 'saveUser',
                    secured: true
                }]
            });
        }
    }
};

global.SERVICE.DefaultFilesLoaderService.LOG = {
    warn: function () {},
    debug: function () {}
};

const service = require('../src/service/audit/defaultRuntimeConfigurationPreviewService');

service.previewActivation({
    tenant: 'default',
    preview: {
        configurationType: 'schemaConfiguration',
        configurationCode: 'tenant'
    }
}).then(success => {
    assert.strictEqual(success.code, 'SUC_SYS_00000');
    assert.strictEqual(success.data.configurationType, 'schemaConfiguration');
    assert.strictEqual(success.data.configurationCode, 'tenant');
    assert.strictEqual(success.data.moduleName, 'profile');
    assert.strictEqual(success.data.operation, 'update');
    assert.strictEqual(success.data.destructive, true);
    assert(success.data.changedPaths.includes('definition.code.type'));
    assert(success.data.warnings.includes('schema property will be removed: displayName'));
    assert(success.data.warnings.includes('schema property type will change: code'));
    assert(success.data.affectedArtifacts.some(artifact => artifact.type === 'service'));

    return service.previewActivation({
        tenant: 'default',
        preview: {
            configurationType: 'routerConfiguration',
            configurationCode: 'runtimeUser'
        }
    });
}).then(success => {
    assert.strictEqual(success.code, 'SUC_SYS_00000');
    assert.strictEqual(success.data.configurationType, 'routerConfiguration');
    assert.strictEqual(success.data.groupName, 'users');
    assert.strictEqual(success.data.previousSnapshot.controller, 'OldUserController');
    assert.strictEqual(success.data.nextSnapshot.controller, 'RuntimeUserController');
    assert(success.data.changedPaths.includes('controller'));
    assert(success.data.warnings.includes('route method will change'));
    assert(success.data.warnings.includes('route operation will change'));
    assert.strictEqual(success.data.destructive, true);
    console.log('Runtime configuration preview service validated');
}).catch(error => {
    console.error(error);
    process.exit(1);
});
