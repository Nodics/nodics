/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module database/test/TenantDatabaseConfigurationValidation
 * @description Proves fail-fast tenant/module database configuration validation,
 * registry isolation, and later-layer module connection overrides.
 * @layer test
 * @owner nDatabase
 * @override Project modules may contribute database configuration overrides;
 * these tests ensure the effective configuration remains tenant isolated.
 */
const assert = require('assert');

class NodicsError extends Error {
    constructor(code, message) { super(message || code && code.message || String(code)); this.code = typeof code === 'string' ? code : code && code.code; }
}
global.CLASSES = { NodicsError };

let activeModules = ['default', 'profile'];
let activeTenants = ['default', 'tenantA'];
global.NODICS = {
    isModuleActive: moduleName => activeModules.includes(moduleName),
    getModule: moduleName => activeModules.includes(moduleName) ? { name: moduleName } : undefined,
    getModules: () => ({ default: {}, profile: {} }),
    getActiveTenants: () => activeTenants.slice()
};

let configurations = {
    default: {
        default: {
            options: { databaseType: 'mongodb', cleanOrphan: true },
            mongodb: {
                options: { connectionHandler: 'DefaultMongodbDatabaseConnectionHandlerService' },
                master: { URI: 'mongodb://default.test:27017', databaseName: 'defaultMaster' }
            }
        }
    },
    tenantA: {
        default: {
            options: { databaseType: 'mongodb', cleanOrphan: true },
            mongodb: {
                options: { connectionHandler: 'DefaultMongodbDatabaseConnectionHandlerService', maxPoolSize: 5 },
                master: { URI: 'mongodb://tenant-a.test:27017', databaseName: 'tenantAMaster' }
            }
        },
        profile: {
            mongodb: {
                options: { maxPoolSize: 9 },
                master: { URI: 'mongodb://profile.tenant-a.test:27017', databaseName: 'tenantAProfile' }
            }
        }
    }
};
global.CONFIG = {
    get: (key, tenant) => {
        if (key === 'database') return configurations[tenant || 'default'];
        if (key === 'defaultTenant') return 'default';
        return undefined;
    }
};

const service = require('../src/service/config/defaultDatabaseConfigurationService');
service.dbs = {};

activeTenants = [];
assert.doesNotThrow(() => service.validateModuleTenant('default', 'default'), 'Configured default tenant must be available during bootstrap');
assert.throws(() => service.validateModuleTenant('default', 'tenantA'), /Invalid or inactive database tenant/, 'Bootstrap must not permit arbitrary tenants');
activeTenants = ['default', 'tenantA'];

assert.throws(() => service.getDatabaseConfiguration('missing', 'tenantA'), /Invalid or inactive database module/);
assert.throws(() => service.getDatabaseConfiguration('profile', 'missingTenant'), /Invalid or inactive database tenant/);

let profileConfig = service.getDatabaseConfiguration('profile', 'tenantA');
assert.strictEqual(profileConfig.master.URI, 'mongodb://profile.tenant-a.test:27017');
assert.strictEqual(profileConfig.master.databaseName, 'tenantAProfile');
assert.strictEqual(profileConfig.options.connectionHandler, 'DefaultMongodbDatabaseConnectionHandlerService');
assert.strictEqual(profileConfig.options.maxPoolSize, 9, 'Later module configuration must override the default adapter option');
assert.strictEqual(profileConfig.options.cleanOrphan, true, 'Default database options must remain inherited');
assert.strictEqual(service.getDatabaseConfiguration('default', 'default').master.databaseName, 'defaultMaster');

configurations.tenantWithoutDatabase = {};
activeTenants.push('tenantWithoutDatabase');
assert.throws(() => service.getDatabaseConfiguration('profile', 'tenantWithoutDatabase'), /database.default/);

configurations.tenantInvalidAdapter = { default: { options: { databaseType: 'mongodb' }, mongodb: { options: {} } } };
activeTenants.push('tenantInvalidAdapter');
assert.throws(() => service.getDatabaseConfiguration('profile', 'tenantInvalidAdapter'), /connectionHandler/);

let tenantADatabase = { master: { name: 'tenant-a-profile' } };
service.addTenantDatabase('profile', 'tenantA', tenantADatabase);
assert.strictEqual(service.getTenantDatabase('profile', 'tenantA'), tenantADatabase);
assert.strictEqual(service.getTenantDatabase('profile', 'default'), undefined, 'A tenant database handle must never leak across tenants');
assert.throws(() => service.addTenantDatabase('profile', 'tenantA'), /handle is required/);
assert.strictEqual(service.removeTenantDatabase('profile', 'tenantA'), true);
assert.strictEqual(service.getTenantDatabase('profile', 'tenantA'), undefined);

console.log('Tenant and module database configuration validation passed');
