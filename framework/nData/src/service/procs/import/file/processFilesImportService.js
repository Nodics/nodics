/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    loadInternalDataFileList: function (request, response, process) {
        this.LOG.debug('Passing through placeholder');
        process.nextSuccess(request, response);
    },

    loadExternalDataFileList: function (request, response, process) {
        this.LOG.debug('Passing through placeholder');
        process.nextSuccess(request, response);
    },

    mergeFileList: function (request, response, process) {
        this.LOG.debug('Passing through placeholder');
        process.nextSuccess(request, response);
    },

    processFiles: function (request, response, process) {
        this.LOG.debug('Passing through placeholder');
        process.nextSuccess(request, response);
    }
};