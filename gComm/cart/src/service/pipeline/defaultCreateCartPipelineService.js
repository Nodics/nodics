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
        this.LOG.debug('Validating create cart request');
        process.nextSuccess(request, response);
    },
    saveCart: function (request, response, process) {
        this.LOG.debug('Creating cart');
        request.cartService.save(request).then(result => {
            response.success = result;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_ORD_00000'));
        });
    },

    postValidation: function (request, response, process) {
        this.LOG.debug('Executing post validation');
        process.nextSuccess(request, response);
    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        console.log('--------------------------------------------');
        console.log(response.success);
        console.log('--------------------------------------------');
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        process.reject(response.error);
    }
};