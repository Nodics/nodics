/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');

global.CLASSES = {
    NodicsError: class NodicsError extends Error {
        constructor(error, message, code) {
            super(message || (error && error.message) || String(error));
            this.code = code || (typeof error === 'string' ? error : undefined);
        }
    }
};

global.UTILS = {
    isBlank: function (value) {
        return value === undefined || value === null ||
            (typeof value === 'string' && value.length === 0) ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0);
    }
};

const baseModel = require('../../src/schemas/model').default;
const versionedModel = require('../src/schemas/model').default;

function modelWithItems(items) {
    return Object.assign({}, baseModel, versionedModel, {
        primaryKey: 'code',
        find: function () {
            return {
                sort: function () {
                    return this;
                },
                count: function () {
                    return Promise.resolve(items.length);
                },
                toArray: function (callback) {
                    callback(null, items.map(item => Object.assign({}, item)));
                }
            };
        },
        insertOne: function (model) {
            this.inserted = model;
            return Promise.resolve({
                ops: [model]
            });
        },
        insertMany: function (models) {
            this.insertedMany = models;
            return Promise.resolve({
                insertedCount: models.length,
                ops: models
            });
        }
    });
}

async function validateVersionedSaveUsesGetItemsEnvelope() {
    const schemaModel = modelWithItems([{ code: 'item-1', name: 'Old', versionId: 2 }]);
    const saved = await schemaModel.saveVersionedItems({
        query: { code: 'item-1' },
        searchOptions: {},
        model: { code: 'item-1', name: 'New', versionId: 3 }
    });
    assert.strictEqual(saved.versionId, 3);
    assert.strictEqual(saved.name, 'New');
    assert.strictEqual(schemaModel.inserted.versionId, 3);
}

async function validateVersionedUpdateUsesGetItemsEnvelope() {
    const schemaModel = modelWithItems([{ code: 'item-1', name: 'Old', versionId: 2 }]);
    const updated = await schemaModel.updateVersionedItems({
        query: { code: 'item-1' },
        searchOptions: {},
        model: { name: 'Updated' }
    });
    assert.strictEqual(updated.insertedCount, 1);
    assert.strictEqual(schemaModel.insertedMany[0].code, 'item-1');
    assert.strictEqual(schemaModel.insertedMany[0].name, 'Updated');
    assert.strictEqual(schemaModel.insertedMany[0].versionId, 3);
}

validateVersionedSaveUsesGetItemsEnvelope()
    .then(validateVersionedUpdateUsesGetItemsEnvelope)
    .then(() => {
        console.log('vMongodb versioned model contract validated');
    })
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
