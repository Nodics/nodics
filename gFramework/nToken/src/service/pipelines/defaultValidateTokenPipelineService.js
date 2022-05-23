/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating Token generation request');
        process.nextSuccess(request, response);
    },
    validateMandateValues: function (request, response, process) {
        this.LOG.debug('Validating Token generation mandate values');
        if (!request.model.key || !request.model.ops || !request.model.value) {
            process.error(request, response, new CLASSES.CronJobError('ERR_TKN_00003', 'Invalid request, please validate'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    buildQuery: function (request, response, process) {
        this.LOG.debug('Building Token generation query');
        process.nextSuccess(request, response);
    },
    validateToken: function (request, response, process) {
        this.LOG.debug('Fatching existing Token');
        request.tokenService.get(_.merge(_.merge({}, request), {
            query: {
                key: request.model.key,
                ops: request.model.ops,
                active: true,
            }
        })).then(result => {
            console.log(result);
            if (result.count > 1 || !result.result || result.result.length != 1) {
                process.error(request, response, new CLASSES.NodicsError('ERR_TKN_00002', 'Token data is not valid'));
            } else if (result.result[0].key === request.model.key
                && result.result[0].ops === request.model.ops
                && result.result[0].value === request.model.value) {
                response.success = {
                    code: 'SUC_TKN_00001'
                };
                process.nextSuccess(request, response);
            } else {
                process.error(request, response, new CLASSES.CronJobError('ERR_TKN_00002', 'Token data is not valid'));
            }
        }).catch(error => {
            process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_TKN_00000'));
        });
    },
    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        process.resolve(response.success);
    },
    handleErrorEnd: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        process.reject(response.error);
    }
};