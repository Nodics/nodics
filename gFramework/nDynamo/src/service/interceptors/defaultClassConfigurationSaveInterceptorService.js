/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const _ = require('lodash');

module.exports = {
    mergeWithExisting: function (request, responce) {
        return new Promise((resolve, reject) => {
            let currentModel = request.model;
            console.log('====================================================');
            console.log(currentModel);
            console.log('...');
            SERVICE.DefaultClassConfigurationService.get({
                tenant: 'default',
                query: {
                    code: currentModel.code
                }
            }).then(success => {
                if (success.result && success.result.length > 0) {
                    let existingModel = success.result[0];
                    currentModel.body = _.merge(existingModel.body, currentModel.body);
                    currentModel.created = existingModel.created || currentModel.created;
                }
                request.model = _.merge({
                    active: currentModel.active || true
                }, currentModel);
                console.log(request.model);
                console.log('...');
                request.model.body = JSON.stringify(request.model.body, function (key, value) {
                    if (typeof value === 'function') {
                        return value.toString();
                    } else {
                        return value;
                    }
                }, 4);
                console.log(request.model);
                console.log('====================================================');
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    }
};