/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');

module.exports = {
    handleApiKeyUpdate: function (event, callback, request) {
        try {
            if (event.data && event.data.apiKey && event.data.tenant) {
                if (!NODICS.getTenants().includes(CONFIG.get('profileModuleName'))) {
                    NODICS.addAPIKey(event.data.tenant, event.data.apiKey, {});
                    callback(null, {
                        success: true,
                        code: 'SUC_SYS_00000',
                        msg: 'Successfully updated API Key for all running tenants'
                    });
                } else {
                    callback(null, {
                        success: true,
                        code: 'SUC_SYS_00000',
                        msg: 'API key is already updated'
                    });
                }
            } else {
                callback({
                    success: false,
                    code: 'ERR_SYS_00000',
                    msg: 'Invalid event, apiKey can not be null or empty'
                });
            }
        } catch (error) {
            callback({
                success: false,
                code: 'ERR_SYS_00000',
                error: error.toString()
            });
        }
    },

    handleApiKeyRemove: function (event, callback, request) {
        try {
            if (event.data && event.data.tenant) {
                if (!NODICS.getTenants().includes(CONFIG.get('profileModuleName'))) {
                    NODICS.removeAPIKey(event.data.tenant);
                    callback(null, {
                        success: true,
                        code: 'SUC_SYS_00000',
                        msg: 'Successfully updated API Key for all running tenants'
                    });
                } else {
                    callback(null, {
                        success: true,
                        code: 'SUC_SYS_00000',
                        msg: 'API key is already updated'
                    });
                }
            } else {
                callback({
                    success: false,
                    code: 'ERR_SYS_00000',
                    msg: 'Invalid event, apiKey can not be null or empty'
                });
            }
        } catch (error) {
            callback({
                success: false,
                code: 'ERR_SYS_00000',
                error: error.toString()
            });
        }
    }
};