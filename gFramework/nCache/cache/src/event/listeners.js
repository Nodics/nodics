/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nCache/cache/event/Listeners
 * @description Registers layered cache configuration and peer-node invalidation event listeners.
 * @layer event
 * @owner nCache/cache
 * @override Project modules may extend cache event listeners while preserving tenant and target-module scope.
 */

module.exports = {
    common: {
        routerCacheChangeListener: {
            event: 'apiCacheChange',
            listener: 'DefaultCacheChangeListenerService.handleRouterCacheChangeEvent'
        },
        itemCacheChangeListener: {
            event: 'itemCacheChange',
            listener: 'DefaultCacheChangeListenerService.handleItemCacheChangeEvent'
        },
        cacheInvalidationListener: {
            event: 'cacheInvalidation',
            listener: 'DefaultCacheChangeListenerService.handleCacheInvalidationEvent'
        },
    }
};
