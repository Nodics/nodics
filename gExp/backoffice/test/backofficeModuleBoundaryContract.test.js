/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/test/backofficeModuleBoundaryContract
 * @description Verifies the gExp group and BackOffice capability metadata preserve the approved backend-only experience boundary and composition contract.
 * @layer test
 * @owner backoffice
 * @override Later project modules may activate or extend BackOffice, but must preserve the published runtime identity and backend-only boundary.
 */
const assert = require('assert');
const path = require('path');

const groupMetadata = require(path.resolve(__dirname, '../../package.json'));
const moduleMetadata = require(path.resolve(__dirname, '../package.json'));

assert.strictEqual(groupMetadata.name, 'gExp');
assert.strictEqual(groupMetadata.nodics.kind, 'group');
assert(groupMetadata.requiredModules.includes('backoffice'),
    'gExp must compose the BackOffice capability');
assert.strictEqual(groupMetadata.nodics.runtime.web, false,
    'gExp must remain backend/API-only');

assert.strictEqual(moduleMetadata.name, 'backoffice');
assert.strictEqual(moduleMetadata.nodics.kind, 'capability');
assert.strictEqual(moduleMetadata.nodics.runtime.router, true,
    'BackOffice must support backend API routes');
assert.strictEqual(moduleMetadata.nodics.runtime.web, false,
    'BackOffice must not become an in-core frontend/web module');
assert(moduleMetadata.nodics.owns.includes('service'));
assert(moduleMetadata.nodics.owns.includes('router'));
assert(moduleMetadata.nodics.owns.includes('schema'));
assert(moduleMetadata.nodics.owns.includes('test'));

console.log('BackOffice module boundary contract validated');
