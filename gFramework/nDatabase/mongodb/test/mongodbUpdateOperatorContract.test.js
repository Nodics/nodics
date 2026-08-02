/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module mongodb/test/mongodbUpdateOperatorContract
 * @description Validates MongoDB schema-model update operator passthrough so framework update services can use $set/$unset safely.
 * @layer test
 * @owner mongodb
 * @override Database adapter replacements must preserve the same update document contract.
 */
const assert = require('assert');

global.SERVICE = {};
global.UTILS = {
    isBlank: value => value === undefined || value === null ||
        (typeof value === 'object' && Object.keys(value).length === 0)
};
global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(error, message, code) {
            super(message || (error && error.message) || String(error));
            this.code = code || error;
        }
    }
};

const model = require('../src/schemas/model').default;

async function run() {
    let writes = [];
    let context = {
        dataBase: { getOptions: () => ({}) },
        updateMany: (query, update, options) => {
            writes.push({ query, update, options });
            return Promise.resolve({ modifiedCount: 1 });
        },
        find: () => ({
            toArray: callback => callback(null, [{
                code: 'runtimeConfigAdminUserGroup',
                permissions: ['old.permission'],
                apiKey: 'legacy-secret'
            }])
        })
    };

    await model.updateItems.call(context, {
        query: { code: 'runtimeConfigAdminUserGroup' },
        model: { permissions: ['payment.backoffice.read'] }
    });
    assert.deepStrictEqual(writes[0].update, {
        $set: { permissions: ['payment.backoffice.read'] }
    });

    await model.updateItems.call(context, {
        query: { code: 'runtimeConfigAdminUserGroup' },
        model: {
            $set: { permissions: ['payment.backoffice.read', 'payment.backoffice.manage'] },
            $unset: { apiKey: 1 }
        }
    });
    assert.deepStrictEqual(writes[1].update, {
        $set: { permissions: ['payment.backoffice.read', 'payment.backoffice.manage'] },
        $unset: { apiKey: 1 }
    });

    await model.updateItems.call(context, {
        query: { code: 'runtimeConfigAdminUserGroup' },
        model: {
            updated: '2026-08-02T00:00:00.000Z',
            updatedBy: 'admin',
            $set: { permissions: ['payment.backoffice.read', 'payment.backoffice.manage'] },
            $unset: { apiKey: 1 }
        }
    });
    assert.deepStrictEqual(writes[2].update, {
        $set: {
            permissions: ['payment.backoffice.read', 'payment.backoffice.manage'],
            updated: '2026-08-02T00:00:00.000Z',
            updatedBy: 'admin'
        },
        $unset: { apiKey: 1 }
    });

    let result = await model.updateItems.call(context, {
        query: { code: 'runtimeConfigAdminUserGroup' },
        options: { returnModified: true },
        model: {
            $set: { permissions: ['payment.backoffice.read'] },
            $unset: { apiKey: 1 }
        }
    });
    assert.strictEqual(result.models[0].apiKey, undefined);
    assert.deepStrictEqual(result.models[0].permissions, ['payment.backoffice.read']);
}

run()
    .then(() => console.log('MongoDB update operator contract validated'))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
