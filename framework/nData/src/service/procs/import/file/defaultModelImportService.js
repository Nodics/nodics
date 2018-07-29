/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    validateModelData: function (request, response, process) {
        this.LOG.debug('Validating data model for import');
        process.nextSuccess(request, response);
    },
    populateDependancies: function (request, response, process) {
        this.LOG.debug('Populating all dependancies');
        process.nextSuccess(request, response);
    },
    insertData: function (request, response, process) {
        this.LOG.debug('Initiating data model import process');
        let header = request[request.importType].headers[request.headerName].header;
        let record = request.currentRecord;
        let model = request.currentModel;

        //console.log('Header : ', header.options);
        //console.log('Current Record Name: ', record);
        //console.log('Current Model: ', model);
        let models = [];

        if (UTILS.isArray(model)) {
            _.each(model, (modelObject, name) => {
                models.push(modelObject);
            });
        } else {
            models.push(model);
        }
        input = {
            tenant: header.options.tenant,
            models: models
        };
        SERVICE['Default' + header.options.modelName.toUpperCaseFirstChar() + 'Service'][header.options.operation](input).then(success => {
            //console.log('Successfuly imported data');
            process.nextSuccess(request, response);
        }).catch(error => {
            //console.log('Import Error: ', error);
            process.nextSuccess(request, response);
        });
    },

    handleSucessEnd: function (request, response) {
        this.LOG.debug('Import Model Process Request has been processed successfully');
        response.modelImportPipeline.promise.resolve(response);
    },

    handleFailureEnd: function (request, response) {
        this.LOG.debug('Import Model Process Request has been processed with some failures : ');
        response.modelImportPipeline.promise.reject(response);
    },

    handleErrorEnd: function (request, response) {
        this.LOG.debug('Import Model Process Request has been processed and got errors : ');
        response.modelImportPipeline.promise.reject(response);
    }
};