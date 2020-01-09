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
        this.LOG.debug('Validating interceptor update request');
        if (!request.code) {
            process.error(request, response, 'Interceptor code can not be null or empty');
        } else {
            process.nextSuccess(request, response);
        }
    },

    loadInterceptor: function (request, response, process) {
        this.LOG.debug('Fatching updated interceptor object : ' + request.code);
        try {
            this.get({
                tenant: 'default',
                query: {
                    code: request.code
                }
            }).then(response => {
                if (response.success && response.result.length > 0) {
                    request.interceptor = response.result[0];
                    process.nextSuccess(request, response);
                } else {
                    process.error(request, response, 'None interceptors found for code: ' + request.code);
                }
            }).catch(error => {
                process.error(request, response, error);
            });
        } catch (error) {
            process.error(request, response, error);
        }
    },

    mergeExisting: function (request, response, process) {
        this.LOG.debug('Adding updated interceptor with existing one');
        let rawInterceptor = {};
        rawInterceptor[request.code] = request.interceptor;
        this.loadRawInterceptors(rawInterceptor);
        process.nextSuccess(request, response);
    },

    publishCleanup: function (request, response, process) {
        this.LOG.debug('Publishing cleanup event for: ' + request.interceptor.type);
        SERVICE.DefaultEventService.handleEvent({
            event: request.interceptor.type + 'InterceptorUpdated',
            target: 'default',
            data: request.interceptor
        }).then(success => {
            response.success = success;
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        if (response.errors && response.errors instanceof Array) {
            process.reject(response.errors[0]);
        } else {
            process.reject(response.error);
        }
    }
};