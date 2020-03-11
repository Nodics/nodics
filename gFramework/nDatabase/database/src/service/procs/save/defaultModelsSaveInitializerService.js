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

    validateInput: function (request, response, process) {
        this.LOG.debug('Validating input for saving models');
        if (!request.models) {
            process.error(request, response, new CLASSES.NodicsError('ERR_SAVE_00003', 'Models can not be null or empty for save operation'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    preProcessor: function (request, response, process) {
        this.LOG.debug('Applying pre processors in models');
        let schemaName = request.schemaModel.schemaName;
        let interceptors = SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors(schemaName);
        if (interceptors && interceptors.preSaveProcessor && interceptors.preSaveProcessor.length > 0) {
            SERVICE.DefaultProcessorHandlerService.executeProcessors([].concat(interceptors.preSaveProcessor), request, response, {}).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_SAVE_00005'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    processModels: function (request, response, process) {
        this.LOG.debug('Processing models');
        if (request.query && !UTILS.isBlank(request.query)) {
            request.originalQuery = _.merge({}, request.query || {});
        }
        this.handleModelsSave(request, response, request.models).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    handleModelsSave: function (request, response, models) {
        return new Promise((resolve, reject) => {
            if (models && models.length > 0) {
                request.model = models.shift();
                try {
                    SERVICE.DefaultPipelineService.start('modelSaveInitializerPipeline', request, {}).then(success => {
                        if (!response.success) response.success = [];
                        response.success.push(success.result);
                        this.handleModelsSave(request, response, models).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        if (!response.failed) response.failed = [];
                        error.metadata = request.model;
                        response.failed.push(error);
                        this.handleModelsSave(request, response, models).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        });
                    });
                } catch (error) {
                    reject(new CLASSES.NodicsError(error, null, 'ERR_SAVE_00000'));
                }
            } else {
                resolve(true);
            }
        });
    },

    postProcessor: function (request, response, process) {
        this.LOG.debug('Applying post processors in models');
        let schemaName = request.schemaModel.schemaName;
        let interceptors = SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors(schemaName);
        if (interceptors && interceptors.postSaveProcessor && interceptors.postSaveProcessor.length > 0) {
            SERVICE.DefaultProcessorHandlerService.executeProcessors([].concat(interceptors.postSaveProcessor), request, response, {}).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_SAVE_00006'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    handleSucessEnd: function (request, response, process) {
        let code = 'SUC_SAVE_00000';
        if (response.failed && response.failed.length > 0) {
            code = (response.success && response.success.length > 0) ? 'SUC_SAVE_00001' : 'ERR_SAVE_00000';
        }
        let output = {
            code: code,
            result: response.success
        };
        if (response.failed && response.failed.length > 0) {
            output.errors = [];
            response.failed.forEach(error => {
                output.errors.push(error.toJson());
            });
        }
        process.resolve(output);
    },

    sampleOutput: function () {
        let result = {
            "code": "SUC_SAVE_00001",
            "result": [
                {
                    "_id": "5e50f289bd5a895f923f25a2",
                    "code": "validatorTest2",
                    "active": "true",
                    "created": "2020-02-22T09:21:13.644Z",
                    "handler": "DefaultSampleValidatorService.handlePreAddressSave",
                    "index": 0,
                    "item": "address",
                    "trigger": "preSave",
                    "type": "schema",
                    "updated": "2020-02-22T09:21:13.644Z"
                },
                {
                    "_id": "5e50f289bd5a895f923f25a4",
                    "code": "validatorTest3",
                    "active": "true",
                    "created": "2020-02-22T09:21:13.650Z",
                    "handler": "DefaultSampleValidatorService.handlePreAddressSave",
                    "index": 0,
                    "item": "address",
                    "trigger": "preSave",
                    "type": "schema",
                    "updated": "2020-02-22T09:21:13.652Z"
                }
            ],
            "errors": [
                {
                    "responseCode": "400",
                    "code": "ERR_SAVE_00000",
                    "name": "MongoError",
                    "message": "Failed to save or update model : Document failed validation",
                    "metadata": {
                        "code": "validatorTest1",
                        "handler": "DefaultSampleValidatorService.handlePreAddressSave",
                        "index": 0,
                        "item": "address",
                        "trigger": "preSave",
                        "type": "schema",
                        "created": "2020-02-22T09:21:13.638Z",
                        "updated": "2020-02-22T09:21:13.640Z"
                    },
                    "stack": "MongoError: Failed to save or update model : Document failed validation\n    at request.schemaModel.saveItems.then.catch.error (/Users/himkardwivedi/apps/HimProjects/nodics/gFramework/nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService.js:322:46)\n    at process._tickCallback (internal/process/next_tick.js:68:7)"
                }
            ],
            "responseCode": "200",
            "message": "Partially success"
        };
    }
};