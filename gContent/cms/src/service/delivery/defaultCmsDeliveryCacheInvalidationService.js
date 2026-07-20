/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/service/delivery/defaultCmsDeliveryCacheInvalidationService
 * @description Invalidates tenant-scoped resolved delivery responses through the authoritative nCache contract after CMS mutations.
 * @layer service
 * @owner cms
 * @override Later modules may narrow invalidation by dependency graph while retaining tenant isolation and peer propagation.
 */
module.exports = {
    /** Initializes the invalidation service lifecycle. */
    init: function () { return Promise.resolve(true); },
    /** Completes the invalidation service lifecycle. */
    postInit: function () { return Promise.resolve(true); },

    /** Invalidates the tenant-scoped CMS delivery router resource. */
    invalidate: function (request) {
        if (!SERVICE.DefaultCacheService || typeof SERVICE.DefaultCacheService.invalidateResource !== 'function') return Promise.resolve(true);
        return SERVICE.DefaultCacheService.invalidateResource({
            tenant: request.tenant,
            authData: request.authData,
            moduleName: 'cms',
            cacheType: 'router',
            resourceName: 'cmsDelivery',
            internalCacheOperation: true
        });
    }
};
