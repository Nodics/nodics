/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module cms/test/cmsSiteReferenceContract @description Validates the service-only bounded CMS Site reference contract used by Store. @layer test @owner cms @override Extend when the CMS-owned safe Site projection changes. */
const assert = require('assert');
const properties = require('../config/properties').cms;
const routers = require('../src/router/routers').cms;
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }
global.CLASSES = { NodicsError };
global.CONFIG = { get: key => key === 'cms' ? properties : undefined };
global.SERVICE = { DefaultCmsSiteService: { get: async request => ({ result: request.query.code === 'electronicsSite' ?
    [{ code: 'electronicsSite', name: 'Electronics', catalog: 'electronicsContent', active: true, secret: 'hidden' }] : [] }) } };
const reference = require('../src/service/defaultCmsSiteReferenceService');

(async () => {
    assert.deepStrictEqual(routers.cmsReference.resolveSite.authTokenTypes, ['service']);
    assert.strictEqual(routers.cmsReference.resolveSite.apiExposure, 'moduleInternal');
    await assert.rejects(reference.resolve({ authData: { tokenType: 'access' }, body: { cmsSiteCode: 'electronicsSite' } }),
        error => error.code === 'ERR_CMS_00080');
    await assert.rejects(reference.resolve({ authData: { tokenType: 'service' }, body: { cmsSiteCode: 'bad code' } }),
        error => error.code === 'ERR_CMS_00081');
    let found = await reference.resolve({ tenant: 'tenantA', authData: { tokenType: 'service' }, body: { cmsSiteCode: 'electronicsSite' } });
    assert.deepStrictEqual(found, { found: true, site: { cmsSiteCode: 'electronicsSite', name: 'Electronics', catalogCode: 'electronicsContent' } });
    let missing = await reference.resolve({ tenant: 'tenantA', authData: { tokenType: 'service' }, body: { cmsSiteCode: 'missing' } });
    assert.deepStrictEqual(missing, { found: false, cmsSiteCode: 'missing' });
    console.log('CMS Site reference contract validated');
})().catch(error => { console.error(error); process.exit(1); });
