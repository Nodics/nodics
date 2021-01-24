/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');

module.exports = {

    getInternalAuthToken: function (request) {
        return new Promise((resolve, reject) => {
            try {
                let authToken = NODICS.getInternalAuthToken(request.tenant);
                resolve({
                    code: 'SUC_AUTH_00000',
                    result: {
                        authToken: authToken
                    }
                });
            } catch (error) {
                reject(new CLASSES.NodicsError(error));
            }
        });
    }
};