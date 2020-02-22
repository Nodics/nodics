/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */



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
        this.LOG.debug('Validating validator update request');
        if (!request.code) {
            process.error(request, response, new CLASSES.NodicsError('ERR_SYS_00001', 'Validator code can not be null or empty'));
        } else if (!request.tenant) {
            process.error(request, response, new CLASSES.NodicsError('ERR_SYS_00001', 'Validator tenant can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    loadValidator: function (request, response, process) {
        this.LOG.debug('Fatching updated validator object : ' + request.code);
        try {
            SERVICE.DefaultValidatorService.get({
                tenant: request.tenant,
                query: {
                    code: request.code
                }
            }).then(response => {
                if (response.success && response.result.length > 0) {
                    request.validator = response.result[0];
                    request.validator.tenant = request.tenant;
                    process.nextSuccess(request, response);
                } else {
                    process.error(request, response, new CLASSES.NodicsError('ERR_SYS_00001', 'None validators found for code: ' + request.code));
                }
            }).catch(error => {
                process.error(request, response, error);
            });
        } catch (error) {
            process.error(request, response, error);
        }
    },

    mergeExisting: function (request, response, process) {
        this.LOG.debug('Adding updated validator with existing one');
        let rawValidator = {};
        rawValidator[request.tenant] = [request.validator];
        SERVICE.DefaultValidatorService.loadRawValidators(rawValidator);
        process.nextSuccess(request, response);
    },

    publishCleanup: function (request, response, process) {
        this.LOG.debug('Publishing cleanup event');
        SERVICE.DefaultEventService.handleEvent({
            event: request.validator.type + 'ValidatorUpdated',
            target: 'default',
            data: request.validator
        }).then(success => {
            response.success = success;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    }
};