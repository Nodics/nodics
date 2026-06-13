/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module service/authentication/DefaultAuthTokenInvalidationService
 * @description Cache listener callbacks for auth token expiration, deletion,
 * and flush events. The default implementation logs token invalidation state and
 * keeps the extension point for distributed token invalidation events.
 * @layer service
 * @owner nService
 * @override Project modules may override these callbacks to publish cluster-wide
 * invalidation events, audit auth lifecycle changes, or synchronize external
 * identity providers.
 */
module.exports = {
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Handles auth token expiration notifications.
     *
     * @param {string} key Cache key.
     * @param {Object} value Cached token payload.
     * @param {Object} options Cache listener options.
     * @returns {undefined}
     */
    publishTokenExpiredEvent: function (key, value, options) {
        key = key.substring(key.lastIndexOf('_') + 1, key.length);
        this.LOG.debug('Auth token has been expired: ' + key);
        /*let _self = this;
        let event = {
            tenant: value.enterprise.tenant.code,
            event: 'invalidateAuthToken',
            source: options.moduleName,
            target: options.moduleName,
            state: 'NEW',
            type: 'SYNC',
            targetType: ENUMS.TargetType.EACH_NODE.key,
            params: [{
                key: key
            }]
        };
        _self.LOG.debug('Pushing event for expired cache key : ' + key);
        SERVICE.DefaultEventService.publish(event, (error, response) => {
            if (error) {
                _self.LOG.error('While posting cache invalidation event : ' , error);
            } else {
                _self.LOG.debug('Event successfully posted : ');
            }
        });*/
    },

    /**
     * Handles auth token deletion notifications.
     *
     * @param {string} key Cache key.
     * @param {Object} value Cached token payload.
     * @param {Object} options Cache listener options.
     * @returns {undefined}
     */
    publishTokenDeletedEvent: function (key, value, options) {
        key = key.substring(key.lastIndexOf('_') + 1, key.length);
        this.LOG.debug('Auth token has been deleted: ' + key);
    },

    /**
     * Handles auth token cache flush notifications.
     *
     * @param {Object} options Cache listener options.
     * @returns {undefined}
     */
    publishTokenFlushedEvent: function (options) {
        this.LOG.debug('Auth tokens has been flushed');
    }
};
