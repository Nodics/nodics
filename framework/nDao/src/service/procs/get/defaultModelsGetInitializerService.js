/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating get request');
        process.nextSuccess(request, response);
    },

    buildOptions: function (request, response, process) {
        this.LOG.debug('Building query options');
        process.nextSuccess(request, response);
    },

    lookupCache: function (request, response, process) {
        this.LOG.debug('Item lookup into cache system');
        process.nextSuccess(request, response);
    },

    executeQuery: function (request, response, process) {
        this.LOG.debug('Executing query: ', request.query);
        request.collection.getItems(request).then(success => {
            response.result = success;
            process.nextSuccess(request, response);
        }).catch(error => {
            response.error = error;
            process.nextFailure(request, response);
        });
    },

    populateSubModels: function (request, response, process) {
        this.LOG.debug('Populating sub models');
        let rawSchema = request.collection.rawSchema;
        if (request.recursive === true && !UTILS.isBlank(rawSchema.refSchema)) {
            this.populateModels(request, response, response.result, 0).then(success => {
                process.nextSuccess(request, response);
            }).catch(error => {
                response.error = error;
                process.nextFailure(request, response);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    populateModels: function (request, response, models, index) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let model = models[index];
            if (model) {
                _self.populateProperties(request, response, model, Object.keys(request.collection.rawSchema.refSchema)).then(success => {
                    _self.populateModels(request, response, models, index + 1).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    populateProperties: function (request, response, model, propertiesList) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let property = propertiesList.shift();
            if (model[property]) {
                let refSchema = request.collection.rawSchema.refSchema;
                let propertyObject = refSchema[property];
                let query = {};
                if (propertyObject.type === 'one') {
                    query[propertyObject.propertyName] = model[property];
                } else {
                    query[propertyObject.propertyName] = {
                        '$in': model[property]
                    }
                }
                let input = {
                    tenant: request.tenant,
                    options: {
                        query: query
                    }
                }
                SERVICE['Default' + propertyObject.schemaName.toUpperCaseFirstChar() + 'Service'].get(input).then(success => {
                    if (propertyObject.type === 'one') {
                        model[property] = success[0];
                    } else {
                        model[property] = success;
                    }
                    if (propertiesList.length > 0) {
                        _self.populateProperties(request, response, model, propertiesList).then(success => {
                            resolve(true);
                        }).catch(error => {
                            reject(error);
                        })
                    } else {
                        resolve(true);
                    }
                }).catch(error => {
                    reject(error);
                });

            } else {
                if (propertiesList.length > 0) {
                    _self.populateProperties(request, response, model, propertiesList).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    })
                } else {
                    resolve(true);
                }
            }
        });
    },

    updateCache: function (request, response, process) {
        this.LOG.debug('Updating cache for new Items');
        //console.log(response.result);
        process.nextSuccess(request, response);
    },

    handleSucessEnd: function (request, response) {
        this.LOG.debug('Request has been processed successfully');
        response.modelsGetInitializerPipeline.promise.resolve(response.result);
    },

    handleFailureEnd: function (request, response) {
        this.LOG.debug('Request has been processed with some failures');
        response.modelsGetInitializerPipeline.promise.reject(response.error);
    },

    handleErrorEnd: function (request, response) {
        this.LOG.debug('Request has been processed and got errors');
        response.modelsGetInitializerPipeline.promise.reject(response.errors);
    }
};