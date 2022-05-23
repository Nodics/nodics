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

    generateOtp: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (!request.model.otpKey || !request.model.ops) {
                reject(new CLASSES.CronJobError('ERR_OTP_00003', 'Invalid request, please validate'));
            } else {
                _self.get(_.merge(_.merge({}, request), {
                    query: {
                        otpKey: request.model.otpKey,
                        ops: request.model.ops,
                        active: true,
                    }
                })).then(response => {
                    if (response.count > 1 || !response.result || response.result.length > 1) {
                        reject(new CLASSES.CronJobError('ERR_OTP_00002', 'OTP data is not valid'));
                    } else if (response.result.length == 1) {
                        resolve(response);
                    } else {
                        _self.save(_.merge({}, request)).then(response => {
                            _self.get(_.merge(_.merge({}, request), {
                                query: {
                                    otpKey: request.model.otpKey,
                                    ops: request.model.ops,
                                    active: true,
                                }
                            })).then(response => {
                                resolve(response);
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    }
                }).catch(error => {
                    reject(error);
                });
            }
        });
    },

    validateOtp: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (!request.model.otpKey || !request.model.ops || !request.model.otpValue) {
                reject(new CLASSES.CronJobError('ERR_OTP_00003', 'Invalid request, please validate'));
            } else {
                _self.get(_.merge(_.merge({}, request), {
                    query: {
                        otpKey: request.model.otpKey,
                        ops: request.model.ops,
                        active: true,
                    }
                })).then(response => {
                    if (response.count > 1 || !response.result || response.result.length != 1) {
                        reject(new CLASSES.CronJobError('ERR_OTP_00002', 'OTP data is not valid'));
                    } else if (response.result[0].otpValue === request.model.otpValue) {
                        resolve({
                            code: 'SUC_OTP_00001'
                        })
                    } else {
                        reject(new CLASSES.CronJobError('ERR_OTP_00002', 'OTP data is not valid'));
                    }
                }).catch(error => {
                    reject(error);
                });
            }
        });
    },
};