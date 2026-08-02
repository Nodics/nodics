/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
    createModelName: name => name + 'Model'
};
let referenceConfig = {
    enabled: true,
    failClosed: true,
    maximumTargetRecords: 2,
    maximumRelationships: 5
};
global.CONFIG = {
    get: name => name === 'referenceIntegrity' ? referenceConfig : undefined
};

let modules = {};
global.NODICS = {
    getModules: () => modules,
    getModule: name => modules[name]
};

const service = require('../src/service/model/defaultReferenceIntegrityService');

function targetModel(records) {
    return {
        moduleName: 'profile',
        schemaName: 'contact',
        getItems: () => Promise.resolve({
            count: records.length,
            result: records
        })
    };
}

function sourceModule(moduleName, schemaName, reference, matches) {
    return {
        rawSchema: {
            [schemaName]: {
                refSchema: {
                    contacts: reference
                }
            }
        },
        models: {
            default: {
                master: {
                    [schemaName + 'Model']: {
                        getItems: request => {
                            assert.deepStrictEqual(request.query, {
                                contacts: {
                                    $in: ['contact-1']
                                }
                            });
                            return Promise.resolve({
                                count: matches.length,
                                result: matches
                            });
                        }
                    }
                }
            }
        }
    };
}

async function run() {
    modules = {
        profile: {
            rawSchema: {}
        }
    };
    await service.enforceRemove({
        tenant: 'default',
        query: { code: 'contact-1' },
        schemaModel: targetModel([{ code: 'contact-1' }])
    });

    modules.profile = sourceModule('profile', 'address', {
        enabled: true,
        schemaName: 'contact',
        type: 'many',
        propertyName: 'code',
        onTargetDelete: 'RESTRICT'
    }, []);
    await service.enforceRemove({
        tenant: 'default',
        query: { code: 'contact-1' },
        schemaModel: targetModel([{ code: 'contact-1' }])
    });

    modules.profile = sourceModule('profile', 'address', {
        enabled: true,
        schemaName: 'contact',
        type: 'many',
        propertyName: 'code',
        onTargetDelete: 'RESTRICT'
    }, [{ code: 'address-1' }]);
    await assert.rejects(() => service.enforceRemove({
        tenant: 'default',
        query: { code: 'contact-1' },
        schemaModel: targetModel([{ code: 'contact-1' }])
    }), error => error.code === 'ERR_DEL_00007');

    modules = {
        profile: {
            rawSchema: {}
        },
        commerce: sourceModule('commerce', 'order', {
            enabled: true,
            moduleName: 'profile',
            schemaName: 'contact',
            propertyName: 'code',
            onTargetDelete: 'RESTRICT'
        }, [{ code: 'order-1' }])
    };
    await assert.rejects(() => service.enforceRemove({
        tenant: 'default',
        query: { code: 'contact-1' },
        schemaModel: targetModel([{ code: 'contact-1' }])
    }), error => error.code === 'ERR_DEL_00007');

    delete modules.commerce.models;
    await assert.rejects(() => service.enforceRemove({
        tenant: 'default',
        query: { code: 'contact-1' },
        schemaModel: targetModel([{ code: 'contact-1' }])
    }), error => error.code === 'ERR_DEL_00008');

    modules = {
        profile: sourceModule('profile', 'address', {
            enabled: true,
            schemaName: 'contact',
            propertyName: 'code',
            onTargetDelete: 'CASCADE'
        }, [{ code: 'address-1' }])
    };
    await service.enforceRemove({
        tenant: 'default',
        query: { code: 'contact-1' },
        schemaModel: targetModel([{ code: 'contact-1' }])
    });

    modules.profile.rawSchema.address.refSchema.contacts.onTargetDelete = 'RESTRICT';
    await assert.rejects(() => service.enforceRemove({
        tenant: 'default',
        query: { code: { $in: ['contact-1', 'contact-2', 'contact-3'] } },
        schemaModel: targetModel([
            { code: 'contact-1' },
            { code: 'contact-2' },
            { code: 'contact-3' }
        ])
    }), error => error.code === 'ERR_DEL_00008');

    console.log('Reference integrity service contract tests passed');
}

run().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
