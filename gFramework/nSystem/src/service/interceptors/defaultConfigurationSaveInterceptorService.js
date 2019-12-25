/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');

module.exports = {

    mergeExisting: function (request, response) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultConfigurationService.get({
                tenant: request.tenant,
                query: {
                    code: 'currentConfiguration'
                }
            }).then(success => {
                if (success.result && success.result.length > 0) {
                    let configModel = success.result[0];
                    request.module.code = 'currentConfiguration';
                    request.module.active = true;
                    request.module.config = _.merge(configModel.config, request.module.config);
                }
                resolve(true);
            }).catch(error => {
                reject(error);
            });
            resolve(true);
        });
    }
};