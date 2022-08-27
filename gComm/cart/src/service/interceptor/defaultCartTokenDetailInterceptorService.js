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

    loadCartToken: function (request, response) {
        return new Promise((resolve, reject) => {
            let cartModel = response.success.result[0];
            if (cartModel.token) {
                SERVICE.DefaultTokenService.get({
                    tenant: request.tenant,
                    query: {
                        value: cartModel.token
                    }
                }).then(result => {
                    if (result.count === 1 && result.result && result.result.length === 1) {
                        cartModel.tokenRef = result.result[0];
                        cartModel.tokenRef.isExpired = false;
                        let tokenModel = result.result[0];
                        let currentTime = new Date;
                        if (tokenModel.expireAt.getTime() < currentTime.getTime()) {
                            cartModel.tokenRef.isExpired = true
                        }
                        resolve(true);
                    } else {
                        reject(new CLASSES.NodicsError('ERR_TKN_00002'));
                    }
                }).catch(error => {
                    reject(new CLASSES.NodicsError(error));
                });
            } else {
                resolve(true);
            }
        });
    }
};