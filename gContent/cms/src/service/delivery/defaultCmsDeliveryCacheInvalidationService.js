/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
        let delivery = (CONFIG.get('cms') || {}).delivery || {};
        let configured = Array.isArray(delivery.cacheResourceNames) ? delivery.cacheResourceNames : [];
        let resources = configured.filter(name => typeof name === 'string' &&
            /^[A-Za-z][A-Za-z0-9]{0,63}$/.test(name));
        if (resources.length === 0) resources = ['resolvePublicPage', 'resolveAuthenticatedPage'];
        return Promise.all(Array.from(new Set(resources)).map(resourceName =>
            SERVICE.DefaultCacheService.invalidateResource({
                tenant: request.tenant,
                authData: request.authData,
                moduleName: 'cms',
                cacheType: 'router',
                resourceName: resourceName,
                internalCacheOperation: true
            })
        ));
    }
};
