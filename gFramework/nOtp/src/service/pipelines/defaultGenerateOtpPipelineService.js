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
        this.LOG.debug('Validating otp generation request');
        process.nextSuccess(request, response);
    },
    validateMandateValues: function (request, response, process) {
        this.LOG.debug('Validating otp generation mandate values');
        if (!request.model.otpKey || !request.model.ops) {
            process.error(request, response, new CLASSES.CronJobError('ERR_OTP_00003', 'Invalid request, please validate'));
        } else {
            process.nextSuccess(request, response);
        }
    },
    buildQuery: function (request, response, process) {
        this.LOG.debug('Building otp generation query');
        process.nextSuccess(request, response);
    },
    checkExistingOtp: function (request, response, process) {
        this.LOG.debug('Fatching existing OTP');
        request.otpService.get(_.merge(_.merge({}, request), {
            query: {
                otpKey: request.model.otpKey,
                ops: request.model.ops,
                active: true,
            }
        })).then(result => {
            if (result.count > 1 || !result.result || result.result.length > 1) {
                process.error(request, response, new CLASSES.NodicsError('ERR_OTP_00002', 'OTP data is not valid'));
            } else if (result.result.length == 1) {
                process.stop(request, response, result);
            } else {
                process.nextSuccess(request, response);
            }
        }).catch(error => {
            process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_OTP_00000'));
        });
    },

    generateNewOtp: function (request, response, process) {
        this.LOG.debug('Generating new OTP');
        request.otpService.save(_.merge({}, request)).then(result => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_OTP_00000'));
        });
    },

    fatchNewOtp: function (request, response, process) {
        this.LOG.debug('Fatching new OTP');
        request.otpService.get(_.merge(_.merge({}, request), {
            query: {
                otpKey: request.model.otpKey,
                ops: request.model.ops,
                active: true,
            }
        })).then(result => {
            response.success = result;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_OTP_00000'));
        });
    }
};