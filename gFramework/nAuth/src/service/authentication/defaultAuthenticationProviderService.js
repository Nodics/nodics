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
        let token = null;
        try {
            let jwtSignOptions = _.merge({}, CONFIG.get('profile').jwtSignOptions || {});
            if (options.tokenLife) jwtSignOptions.expiresIn = options.tokenLife;
            if (options.lifetime) delete jwtSignOptions.expiresIn;
            let payload = {
                enterpriseCode: options.enterpriseCode,
                tenant: options.tenant,
                refreshToken: options.refreshToken
            };
            if (options.loginId) payload.loginId = options.loginId;
            if (options.apiKey) payload.apiKey = options.apiKey;
            token = jwt.sign(payload, CONFIG.get('jwtSecretKey') || 'nodics', jwtSignOptions);
        } catch (error) {
            throw error;
        }
        return token;
    }
};