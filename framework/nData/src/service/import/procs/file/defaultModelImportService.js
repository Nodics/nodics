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
        let header = request[request.importType].headers[request.headerName].header;
        if (header.macros) {
            if (header.rawSchema.refSchema) {
                let options = {
                    header: header,
                    refSchema: header.rawSchema.refSchema,
                    properties: Object.keys(header.macros),
                    macros: header.macros
                };
                this.resolveRelation(request, response, options).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
            } else {
                this.LOG.warn('Macros definition can not be used without schema ref definition');
                process.nextSuccess(request, response);
            }
        } else {
            process.nextSuccess(request, response);
        }
    },

    resolveRelation: function (request, response, options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (options.properties && options.properties.length > 0) {
                let property = options.properties.shift();
                let model = request.currentModel;
                if (options.refSchema[property] && model[property]) {
                    let refObject = options.refSchema[property];
                    if (refObject.type === 'one') {
                        _self.resolveOneToOneRelation(request, response, {
                            refObject: refObject,
                            model: model,
                            property: property,
                            value: model[property],
                            macro: options.macros[property]
                        }).then(success => {
                            model[property] = success[0];
                            _self.resolveRelation(request, response, options).then(success => {
                                resolve(true);
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        let input = {
                            refObject: refObject,
                            model: model,
                            property: property,
                            values: model[property].split(','),
                            macro: options.macros[property],
                            result: []
                        };
                        _self.resolveOneToManyRelation(request, response, input).then(success => {
                            model[property] = success;
                            _self.resolveRelation(request, response, options).then(success => {
                                resolve(true);
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    }
                } else {
                    this.resolveRelation(request, response, options).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }
            } else {
                resolve(true);
            }
        });
    },


    resolveOneToOneRelation: function (request, response, options) {
        return new Promise((resolve, reject) => {
            this.fetchModel(request, response, {
                property: options.property,
                value: options.value,
                macro: options.macro
            }).then(success => {
                resolve(success);
            }).catch(error => {
                reject(error);
            });
        });
    },

    resolveOneToManyRelation: function (request, response, options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (options.values && options.values.length > 0) {
                let value = options.values.shift();
                this.fetchModel(request, response, {
                    property: options.property,
                    value: value,
                    macro: options.macro
                }).then(success => {
                    options.result.push(success[0]);
                    _self.resolveOneToManyRelation(request, response, options).then(success => {
                        resolve(options.result);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(options.result);
            }
        });
    },

    fetchModel: function (request, response, options) {
        return new Promise((resolve, reject) => {
            let values = options.value.split(':');
            let query = {};
            let properties = Object.keys(options.macro.rule);
            for (let count = 0; count < properties.length; count++) {
                let propertyName = properties[count];
                let propertyObject = options.macro.rule[propertyName];
                if (propertyObject.type === 'Number' || propertyObject.type === 'number') {
                    query[propertyName] = parseInt(values[propertyObject.index]);
                } else if (propertyObject.type === 'Boolean' || propertyObject.type === 'boolean') {
                    query[propertyName] = (values[propertyObject.index] === 'true');
                } else {
                    query[propertyName] = values[propertyObject.index];
                }
            }
            let input = {
                tenant: request.tenant || 'default',
                options: {
                    query: query
                }
            };
            SERVICE['Default' + options.macro.options.model.toUpperCaseFirstChar() + 'Service'].get(input).then(result => {
                if (result.length <= 0) {
                    reject('None ' + options.macro.options.model.toUpperCaseFirstChar() + 's found');
                } else {
                    let data = [];
                    result.forEach(element => {
                        data.push(element[options.macro.options.returnProperty || '_id']);
                    });
                    resolve(data);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    insertData: function (request, response, process) {
        this.LOG.debug('Initiating data model import process');
        let header = request[request.importType].headers[request.headerName].header;
        let model = request.currentModel;
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
            query: header.query,
            models: models
        };
        SERVICE['Default' + header.options.modelName.toUpperCaseFirstChar() + 'Service'][header.options.operation](input).then(result => {
            response.success.concat(result);
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, error);
        });
    },

    handleSucessEnd: function (request, response) {
        this.LOG.debug('Import Model Process Request has been processed successfully');
        response.modelImportPipeline.promise.resolve({
            success: response.success,
            errors: response.errors
        });
    },

    handleFailureEnd: function (request, response) {
        this.LOG.debug('Import Model Process Request has been processed with some failures');
        response.modelImportPipeline.promise.reject(response.result);
    },

    handleErrorEnd: function (request, response) {
        this.LOG.debug('Import Model Process Request has been processed and got errors');
        response.modelImportPipeline.promise.reject(response.result.error);
    }
};