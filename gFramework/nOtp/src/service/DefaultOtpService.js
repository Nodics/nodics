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
        return new Promise((resolve, reject) => {
            request.model.type = 'OTP';
            SERVICE.DefaultTokenService.generateToken(request).then(success => {
                resolve(success);
            }).catch(error => {
                reject(new CLASSES.NodicsError(error, null, 'ERR_OTP_00000'));
            });
        });
    },

    validateOtp: function (request) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultTokenService.validateToken(request).then(success => {
                resolve(success);
            }).catch(error => {
                reject(new CLASSES.NodicsError(error, null, 'ERR_OTP_00000'));
            });
        });
    },
};