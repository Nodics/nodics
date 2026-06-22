/**
 * @module nCache/cache/service/event/DefaultCacheChangeListenerService
 * @description Adapts distributed cache configuration events into tenant-aware local service updates.
 * @layer service
 * @owner nCache/cache
 * @override Project modules may extend event handling while preserving target-module, tenant, and callback semantics.
 */
module.exports = {

    /** Applies a router-cache event and reports completion through the event callback contract. */
    handleRouterCacheChangeEvent: function (event, callback) {
        try {
            SERVICE.DefaultCacheService.handleRouterCacheChangeEvent({
                tenant: event.tenant,
                moduleName: event.target,
                config: event.data
            }).then(success => {
                callback(null, {
                    success: true,
                    code: 'SUC_EVNT_00000',
                    message: success
                });
            }).catch(error => {
                callback({
                    success: false,
                    code: 'ERR_EVNT_00000',
                    message: error
                });
            });
        } catch (error) {
            callback({
                success: false,
                code: 'ERR_EVNT_00000',
                message: error
            });
        }
    },

    /** Applies an item-cache event and reports completion through the event callback contract. */
    handleItemCacheChangeEvent: function (event, callback) {
        try {
            SERVICE.DefaultCacheService.handleItemCacheChangeEvent({
                tenant: event.tenant,
                moduleName: event.target,
                config: event.data
            }).then(success => {
                callback(null, {
                    success: true,
                    code: 'SUC_EVNT_00000',
                    message: success
                });
            }).catch(error => {
                callback({
                    success: false,
                    code: 'ERR_EVNT_00000',
                    message: error
                });
            });
        } catch (error) {
            callback({
                success: false,
                code: 'ERR_EVNT_00000',
                message: error
            });
        }
    }
};
