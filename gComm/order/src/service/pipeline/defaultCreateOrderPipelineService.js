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
        this.LOG.debug('Validating create order request');
        process.nextSuccess(request, response);
    },
    validateMandateValues: function (request, response, process) {
        this.LOG.debug('Validating create order mandate values');
        process.nextSuccess(request, response);
        // if (!request.model.key || !request.model.ops) {
        //     process.error(request, response, new CLASSES.CronJobError('ERR_ORD_00001', 'Invalid request, please validate'));
        // } else {
        //     process.nextSuccess(request, response);
        // }
    },

    validateItems: function (request, response, process) {
        this.LOG.debug('Validating associated items');
        process.nextSuccess(request, response);
    },

    validateConsignments: function (request, response, process) {
        this.LOG.debug('Validating associated consignments');
        process.nextSuccess(request, response);
    },

    validatePayments: function (request, response, process) {
        this.LOG.debug('Validating associated payments');
        process.nextSuccess(request, response);
    },

    validateOrder: function (request, response, process) {
        this.LOG.debug('Validating associated order');
        process.nextSuccess(request, response);
    },

    saveOrder: function (request, response, process) {
        this.LOG.debug('Creating order');
        process.nextSuccess(request, response);
    },

    postValidation: function (request, response, process) {
        this.LOG.debug('Executing post validation');
        process.nextSuccess(request, response);
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