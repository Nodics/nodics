/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const jwt = require('jsonwebtoken');

module.exports = {
    generateAuthToken: function (options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let jwtSignOptions = _.merge({}, CONFIG.get('profile').jwtSignOptions || {});
                if (options.requiredRefreshToken) {
                    _self.createRefreshToken({
                        enterpriseCode: options.enterpriseCode,
                        tenant: options.tenant,
                        loginId: options.loginId,
                        password: options.password,
                        apiKey: options.apiKey,
                        type: options.type
                    }).then(refreshToken => {
                        if (options.tokenLife) jwtSignOptions.expiresIn = options.tokenLife;
                        if (options.lifetime) delete jwtSignOptions.expiresIn;
                        let token = jwt.sign({
                            enterpriseCode: options.enterpriseCode,
                            tenant: options.tenant,
                            loginId: options.loginId,
                            refreshToken: refreshToken
                        }, CONFIG.get('jwtSecretKey') || 'nodics', jwtSignOptions);
                        resolve({
                            authToken: token
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    if (options.tokenLife) jwtSignOptions.expiresIn = options.tokenLife;
                    if (options.lifetime) delete jwtSignOptions.expiresIn;
                    let token = jwt.sign({
                        enterpriseCode: options.enterpriseCode,
                        tenant: options.tenant,
                        loginId: options.loginId
                    }, CONFIG.get('jwtSecretKey') || 'nodics', jwtSignOptions);
                    resolve({
                        authToken: token
                    });
                }
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_AUTH_00000',
                    error: error
                });
            }
        });
    }
};