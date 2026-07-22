/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module cms/service/DefaultCmsSiteReferenceService @description Exposes a bounded tenant-scoped CMS Site projection to internal Store and commerce consumers. @layer service @owner cms @override Projects may extend safe fields while preserving service-only access, bounded lookup, and CMS Site authority. */
module.exports = {
    /** Initializes Site reference lookup. */ init: function () { return Promise.resolve(true); },
    /** Completes initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Resolves one active CMS Site. */ resolve: async function (request) { let policy = (CONFIG.get('cms') || {}).referenceLookup || {}, auth = request && request.authData || {}, input = request && request.body || {}; if (policy.requireServiceToken !== false && auth.tokenType !== 'service') throw new CLASSES.NodicsError('ERR_CMS_00080', 'CMS Site reference requires service identity'); if (typeof input.cmsSiteCode !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(input.cmsSiteCode) || input.cmsSiteCode.length > 128) throw new CLASSES.NodicsError('ERR_CMS_00081', 'CMS Site code is invalid'); let response = await SERVICE.DefaultCmsSiteService.get({ tenant: request.tenant, authData: request.authData, query: { code: input.cmsSiteCode, active: true }, searchOptions: { limit: Number(policy.maximumResultCount || 1) + 1 } }), items = response && Array.isArray(response.result) ? response.result : []; if (items.length !== 1) return { found: false, cmsSiteCode: input.cmsSiteCode }; let site = items[0]; return { found: true, site: { cmsSiteCode: site.code, name: site.name, catalogCode: site.catalog } }; }
};
