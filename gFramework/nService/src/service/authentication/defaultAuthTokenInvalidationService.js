/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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

    publishTokenExpiredEvent: function (key, value, options) {
        key = key.substring(key.lastIndexOf('_') + 1, key.length);
        this.LOG.debug('Auth token has been expired: ' + key);
        /*let _self = this;
        let event = {
            enterpriseCode: value.enterprise.code,
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
        _self.LOG.debug('Pushing event for expired cache key : ', key);
        SERVICE.DefaultEventService.publish(event, (error, response) => {
            if (error) {
                _self.LOG.error('While posting cache invalidation event : ', error);
            } else {
                _self.LOG.debug('Event successfully posted : ');
            }
        });*/
    },

    publishTokenDeletedEvent: function (key, value, options) {
        key = key.substring(key.lastIndexOf('_') + 1, key.length);
        this.LOG.debug('Auth token has been deleted: ' + key);
    },

    publishTokenFlushedEvent: function (options) {
        this.LOG.debug('Auth tokens has been flushed');
    }
};