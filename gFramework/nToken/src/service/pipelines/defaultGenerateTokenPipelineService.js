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
        if (!request.model.key || !request.model.ops) {
            process.error(request, response, new CLASSES.CronJobError('ERR_TKN_00003', 'Invalid request, please validate'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    buildQuery: function (request, response, process) {
        this.LOG.debug('Building Token generation query');
        process.nextSuccess(request, response);
    },
    checkExistingToken: function (request, response, process) {
        this.LOG.debug('Fatching existing Token');
        request.tokenService.get(_.merge(_.merge({}, request), {
            query: {
                key: request.model.key,
                ops: request.model.ops,
                active: true,
            }
        })).then(result => {
            if (result.count > 1 || !result.result || result.result.length > 1) {
                process.error(request, response, new CLASSES.NodicsError('ERR_TKN_00002', 'Token data is not valid'));
            } else if (result.result.length == 1) {
                process.stop(request, response, result);
            } else {
                process.nextSuccess(request, response);
            }
        }).catch(error => {
            process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_TKN_00000'));
        });
    },

    generateNewToken: function (request, response, process) {
        this.LOG.debug('Generating new Token');
        request.tokenService.save(_.merge({}, request)).then(result => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_TKN_00000'));
        });
    },

    fatchNewToken: function (request, response, process) {
        this.LOG.debug('Fatching new Token');
        request.tokenService.get(_.merge(_.merge({}, request), {
            query: {
                key: request.model.key,
                ops: request.model.ops,
                active: true,
            }
        })).then(result => {
            response.success = result;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_TKN_00000'));
        });
    },
    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        let success = {
            code: response.success.code || 'SUC_SYS_00000',
            cache: response.success.cache,
            result: {
                _id: response.success.result[0]._id,
                key: response.success.result[0].key,
                ops: response.success.result[0].ops,
                value: response.success.result[0].value,
                valid: response.success.result[0].expireAt
            }
        }
        process.resolve(success);
    },
    handleErrorEnd: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        process.reject(response.error);
    }
};