/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module vService/test/VersionedSaveResponseContract
 * @description Verifies the vService save override preserves the standard model-save pipeline response contract for versioned and non-versioned schemas.
 * @layer test
 * @owner vService
 * @override Not applicable; this test protects the shared pipeline response boundary.
 */
const assert = require('assert');
global.UTILS = { isArray: Array.isArray };
global.CLASSES = { NodicsError: class NodicsError extends Error {} };
const service = require('../src/service/procs/save/defaultModelSaveInitializerService');
service.LOG = { debug: function () {}, error: function () {} };

function save(versioned) {
    let saved = { code: versioned ? 'versioned' : 'standard' }, response = {};
    return new Promise((resolve, reject) => service.saveModel({ schemaModel: {
        schemaName: saved.code, versioned: versioned,
        saveVersionedItems: async function () { return saved; }, saveItems: async function () { return saved; }
    } }, response, {
        nextSuccess: function () { try { assert.strictEqual(response.success.result, saved); assert.strictEqual(response.model, undefined); resolve(true); } catch (error) { reject(error); } },
        error: function (request, output, error) { reject(error); }
    }));
}

(async function () { await save(false); await save(true); console.log('vService save response contract validated'); })()
    .catch(error => { console.error(error); process.exit(1); });
