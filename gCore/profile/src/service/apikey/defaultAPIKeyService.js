/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');

module.exports = {

    getAPIKey: function (request) {
        return new Promise((resolve, reject) => {
            try {
                let apiKey = NODICS.getAPIKey(request.tenant);
                resolve({
                    success: true,
                    code: 'SUC_SYS_00000',
                    result: {
                        apiKey: apiKey.key
                    }
                });
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_SYS_00000',
                    error: error.toString()
                });
            }
        });
    },

    updateAPIKey: function (request) {
        return new Promise((resolve, reject) => {
            try {
                let apiKey = NODICS.getAPIKey(request.tenant);
                resolve({
                    success: true,
                    code: 'SUC_SYS_00000',
                    msg: 'This feature currently not available, will be implemented soon'
                });
            } catch (error) {
                reject({
                    success: false,
                    code: 'ERR_SYS_00000',
                    error: error.toString()
                });
            }
        });
    }
};