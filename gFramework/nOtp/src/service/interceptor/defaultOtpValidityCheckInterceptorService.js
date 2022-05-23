/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information")
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics
*/

const _ = require('lodash');

module.exports = {
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    fetchValidOtp: function (request, response) {
        return new Promise((resolve, reject) => {
            if (request.options.loadValid) {
                request.query = _.merge(request.query, {
                    expireAt: {
                        "$gte": new Date()
                    },
                    active: true
                });
            }
            resolve(true);
        });
    },

    checkOtpValidity: function (request, response) {
        return new Promise((resolve, reject) => {
            if (response.success.count > 1) {
                reject(new CLASSES.CronJobError('ERR_OTP_00002', 'OTP data is not valid'));
            } else if (!response.success || !response.success.result || response.success.result.length > 1) {
                reject(new CLASSES.CronJobError('ERR_OTP_00003', 'OTP data is not valid'));
            } else if (response.success.result.length == 1) {
                let expireAt = response.success.result[0].expireAt;
                let currentTime = new Date();
                if (currentTime <= expireAt) {
                    resolve(true);
                } else {
                    reject(new CLASSES.CronJobError('ERR_OTP_00001', 'OTP already expired'));
                }
            } else {
                resolve(true);
            }
        });
    },

    updateCache: function (request, response) {
        return new Promise((resolve, reject) => {
            request.cacheKeyHash = request.cacheKeyHash || SERVICE.DefaultCacheConfigurationService.createItemKey(request);
            if (UTILS.isItemCashable(response.success.result, request.schemaModel)) {
                SERVICE.DefaultCacheService.put({
                    moduleName: request.schemaModel.moduleName,
                    channelName: SERVICE.DefaultCacheService.getSchemaCacheChannel(request.schemaModel.schemaName),
                    key: request.cacheKeyHash,
                    value: response.success.result,
                    ttl: request.schemaModel.cache.ttl
                }).then(success => {
                    this.LOG.info('Item saved in item cache');
                }).catch(error => {
                    this.LOG.error('While saving item in item cache : ', error);
                });
            }
            resolve(true);
        });
    }
};