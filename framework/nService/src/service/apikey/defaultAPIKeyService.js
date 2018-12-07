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
                if (!request.param || !request.param.apiKey) {
                    reject({
                        success: false,
                        code: 'ERR_SYS_00000',
                        msg: 'Invalid request, apiKey can not be null or empty'
                    });
                } else {
                    let params = [{
                        key: 'apiKey',
                        value: request.param.apiKey
                    }];
                    if (request.param.tenant) {
                        params.push({
                            key: 'tenant',
                            value: request.param.tenant
                        });
                    }
                    let event = {
                        enterpriseCode: request.enterpriseCode,
                        tenant: request.tenant,
                        event: 'updateAPIKey',
                        source: request.moduleName,
                        target: request.moduleName,
                        state: "NEW",
                        type: "SYNC",
                        targetType: ENUMS.TargetType.EACH_NODE.key,
                        params: params
                    };
                    this.LOG.debug('Pushing event for APIKey updated');
                    SERVICE.DefaultEventService.publish(event).then(success => {
                        this.LOG.debug('Event successfully posted');
                    }).catch(error => {
                        this.LOG.error('While posting model change event : ', error);
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
    },

    handleAPIKeyUpdate: function (event, callback) {
        try {
            if (!event.params) {
                callback({
                    success: false,
                    code: 'ERR_SYS_00000',
                    msg: 'Invalid event, apiKey can not be null or empty'
                });
            } else {
                let apiKey, tenant;
                event.params.forEach(element => {
                    if (element.key === 'apiKey') {
                        apiKey = element.value;
                    } else if (element.key === 'tenant') {
                        tenant = element.value;
                    }
                });
                let tenants = [];
                if (tenant) {
                    tenants = [tenant];
                } else {
                    tenants = NODICS.getTenants();
                }
                tenants.forEach(element => {
                    CONFIG.setProperties(_.merge(CONFIG.getProperties(element), {
                        apiKey: apiKey
                    }), element);
                });
                callback(null, {
                    success: true,
                    code: 'SUC_SYS_00000',
                    msg: 'Successfully updated API Key for all running tenants'
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