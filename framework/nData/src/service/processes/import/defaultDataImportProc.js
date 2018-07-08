/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating request');
        process.nextSuccess(request, response);
    },

    redirectToImportType: function (request, response, process) {
        this.LOG.debug('Checking target process to handle request');
        if (request.local.secured) {
            this.LOG.debug('Redirecting to importFromFileProcess');
            process.nextSuccess(request, response);
        } else {
            this.LOG.debug('Redirecting to importFromDirectProcess');
            process.nextFailure(request, response);
        }
    },

    handleSucessEnd: function (request, response) {
        this.LOG.debug('Request has been processed successfully : ');
        request.local.httpResponse.json(response);
    },

    handleFailureEnd: function (request, response) {
        this.LOG.debug('Request has been processed with some failures : ');
        request.local.httpResponse.json(response);
    },

    handleErrorEnd: function (request, response) {
        this.LOG.debug('Request has been processed and got errors : ');
        request.local.httpResponse.json(response);
    }

};