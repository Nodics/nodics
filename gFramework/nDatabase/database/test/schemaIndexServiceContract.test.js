/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nDatabase/database/test/schemaIndexServiceContract
 * @description Verifies schema index maintenance fans out across active tenants, master/test channels, modules, and schema-scoped model lookups.
 * @layer test
 * @owner nDatabase
 * @override Database provider modules may override index creation, but schema index maintenance must preserve module, tenant, channel, and schema scoping.
 */

const assert = require('assert');

global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(code, message) {
            super(message || code);
            this.code = code;
        }
    }
};

global.UTILS = {
    createModelName: function (schemaName) {
        return schemaName + 'Model';
    }
};

const modelRegistry = {
    profile: {
        default: {
            master: {
                tenantModel: { name: 'profile.default.master.tenant' },
                addressModel: { name: 'profile.default.master.address' }
            },
            test: {
                tenantModel: { name: 'profile.default.test.tenant' }
            }
        },
        tenantB: {
            master: {
                tenantModel: { name: 'profile.tenantB.master.tenant' }
            },
            test: {}
        }
    },
    catalog: {
        default: {
            master: {
                productModel: { name: 'catalog.default.master.product' }
            },
            test: {}
        },
        tenantB: {
            master: {},
            test: {
                productModel: { name: 'catalog.tenantB.test.product' }
            }
        }
    }
};

const indexCalls = [];

global.NODICS = {
    getActiveTenants: function () {
        return ['default', 'tenantB'];
    },
    getModules: function () {
        return {
            profile: {},
            catalog: {}
        };
    },
    getModels: function (moduleName, tenant, channel) {
        return modelRegistry[moduleName] &&
            modelRegistry[moduleName][tenant] &&
            modelRegistry[moduleName][tenant][channel];
    }
};

global.SERVICE = {
    DefaultDatabaseModelHandlerService: {
        createIndexes: function (model) {
            indexCalls.push(model.name);
            return Promise.resolve({ model: model.name, indexed: true });
        }
    }
};

const service = require('../src/service/schema/defaultSchemaIndexService');

(async function run() {
    let result = await service.updateSchemaIndexes('profile', 'tenant');
    assert.deepStrictEqual(indexCalls, [
        'profile.default.master.tenant',
        'profile.default.test.tenant',
        'profile.tenantB.master.tenant'
    ]);
    assert.deepStrictEqual(result.map(item => item.model), indexCalls);

    indexCalls.length = 0;
    result = await service.updateModuleIndexes('profile');
    assert.deepStrictEqual(indexCalls, [
        'profile.default.master.tenant',
        'profile.default.master.address',
        'profile.default.test.tenant',
        'profile.tenantB.master.tenant'
    ]);
    assert.strictEqual(result.length, 4);

    indexCalls.length = 0;
    result = await service.updateModulesIndexes();
    assert.deepStrictEqual(indexCalls, [
        'profile.default.master.tenant',
        'profile.default.master.address',
        'profile.default.test.tenant',
        'profile.tenantB.master.tenant',
        'catalog.default.master.product',
        'catalog.tenantB.test.product'
    ]);
    assert.strictEqual(result.length, 6);

    await assert.rejects(() => service.updateSchemaIndexes('profile', 'missing'), error => {
        assert.strictEqual(error.code, 'ERR_DBS_00000');
        assert(error.message.includes('missing'));
        return true;
    });

    console.log('Schema index service contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
