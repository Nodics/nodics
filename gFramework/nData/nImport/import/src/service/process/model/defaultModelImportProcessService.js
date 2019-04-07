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
        this.LOG.debug('Validating request');
        if (!request.header) {
            process.error(request, response, 'Please validate request. Mandate property header not have valid value');
        } else if (!request.dataModel) {
            process.error(request, response, 'Please validate request. Mandate property dataModel not have valid value');
        } else if (!request.header.options.schemaName && !request.header.options.indexName) {
            process.error(request, response, 'Please validate request. Both schemaName and indexName can not be null or empty');
        } else {
            process.nextSuccess(request, response);
        }
    },

    resolveEnterpriseCode: function (request, response, process) {
        if (request.dataModel.enterpriseCode && request.enterpriseCode && request.dataModel.enterpriseCode !== request.enterpriseCode) {
            request.dataModel.enterpriseCode = request.enterpriseCode;
        }
        process.nextSuccess(request, response);
    },

    populateSchemaDependancies: function (request, response, process) {
        this.LOG.debug('Populating all schema dependancies');
        let header = request.header;
        if (header.macros) {
            if (header.rawSchema.refSchema) {
                this.resolveRelation(request, response, {
                    header: header,
                    refSchema: header.rawSchema.refSchema,
                    properties: Object.keys(header.macros),
                    macros: header.macros
                }).then(success => {
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
                let model = request.dataModel;
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
                        _self.resolveOneToManyRelation(request, response, {
                            refObject: refObject,
                            model: model,
                            property: property,
                            values: model[property],
                            macro: options.macros[property],
                            result: []
                        }).then(success => {
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
                } else if (propertyObject.type === 'Boolean' ||
                    propertyObject.type === 'boolean' ||
                    propertyObject.type === 'bool' ||
                    propertyObject.type === 'Bool') {
                    query[propertyName] = (values[propertyObject.index] === 'true');
                } else {
                    query[propertyName] = values[propertyObject.index];
                }
            }
            SERVICE['Default' + options.macro.options.model.toUpperCaseFirstChar() + 'Service'].get({
                tenant: request.tenant,
                query: query
            }).then(result => {
                if (result && result.success && result.result && result.result.length > 0) {
                    let data = [];
                    result.result.forEach(element => {
                        data.push(element[options.macro.options.returnProperty || '_id']);
                    });
                    resolve(data);
                } else {
                    reject({
                        success: false,
                        code: 'ERR_IMP_00000',
                        msg: 'None ' + options.macro.options.model.toUpperCaseFirstChar() + 's found'
                    });
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    populateSearchDependancies: function (request, response, process) {
        this.LOG.debug('Populating all search dependancies');
        process.nextSuccess(request, response);
    },

    insertSchemaModel: function (request, response, process) {
        let header = request.header;
        if (header.options.schemaName) {
            this.LOG.debug('Initiating data model import process');
            let model = request.dataModel;
            let models = [];
            if (UTILS.isArray(model)) {
                _.each(model, (modelObject, name) => {
                    models.push(modelObject);
                });
            } else {
                models.push(model);
            }
            SERVICE['Default' + header.options.schemaName.toUpperCaseFirstChar() + 'Service'][header.options.operation]({
                tenant: request.tenant,
                query: header.query,
                models: models
            }).then(result => {
                if (!result) {
                    process.error(request, response, {
                        success: false,
                        code: 'ERR_IMP_00001',
                        msg: 'Could not found any response from data access layer'
                    });
                } else if (result.success) {
                    if (UTILS.isArray(result.result)) {
                        result.result.forEach(element => {
                            response.success.push(element);
                        });
                    } else {
                        response.success.push(result.result);
                    }
                    //response.targetNode = 'insertSuccess';
                    process.nextSuccess(request, response);
                } else {
                    process.error(request, response, result);
                }
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    insertSearchModel: function (request, response, process) {
        this.LOG.debug('Initiating data model import process');
        let header = request.header;
        if (header.options.indexName) {
            let searchService = SERVICE['Default' + header.options.indexName.toUpperCaseFirstChar() + 'Service'] || SERVICE.DefaultSearchService;
            searchService[header.options.operation]({
                tenant: request.tenant,
                indexName: request.indexName,
                moduleName: request.moduleName,
                options: request.options || {},
                model: request.dataModel
            }).then(result => {
                if (!result) {
                    process.error(request, response, {
                        success: false,
                        code: 'ERR_IMP_00001',
                        msg: 'Could not found any response from data access layer'
                    });
                } else if (result.success) {
                    if (UTILS.isArray(result.result)) {
                        result.result.forEach(element => {
                            response.success.push(element);
                        });
                    } else {
                        response.success.push(result.result);
                    }
                    process.nextSuccess(request, response);
                } else {
                    process.error(request, response, result);
                }
            }).catch(error => {
                process.error(request, response, error);
            });
        } else {
            process.nextSuccess(request, response);
        }
    },

    handleSucessEnd: function (request, response, process) {
        process.resolve(response.success);
    },

    handleErrorEnd: function (request, response, process) {
        if (response.errors && response.errors.length === 1) {
            process.reject(response.errors[0]);
        } else if (response.errors && response.errors.length > 1) {
            process.reject({
                success: false,
                code: 'ERR_SYS_00000',
                error: response.errors
            });
        } else {
            process.reject(response.error);
        }
    }
};