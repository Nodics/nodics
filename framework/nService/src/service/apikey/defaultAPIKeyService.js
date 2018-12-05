/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');

module.exports = {

    updateAPIKey: function (request) {
        return new Promise((resolve, reject) => {
            try {
                if (!request.apiKey) {
                    reject({
                        success: false,
                        code: 'ERR_SYS_00000',
                        msg: 'Invalid request, apiKey can not be null or empty'
                    });
                } else {
                    let tenants = NODICS.getTenants();
                    tenants.forEach(element => {
                        CONFIG.setProperties(_.merge(CONFIG.getProperties(element), {
                            apiKey: request.apiKey
                        }), element);
                    });
                    resolve({
                        success: true,
                        code: 'SUC_SYS_00000',
                        msg: 'Successfully updated API Key for all running tenants'
                    });
                }
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