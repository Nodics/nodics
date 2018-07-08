/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    loadFileData: function (request, response, process) {
        this.LOG.debug('Passing through placeholder');
        process.nextSuccess(request, response);
    },

    importFileData: function (request, response, process) {
        this.LOG.debug('Passing through placeholder');
        process.nextSuccess(request, response);
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