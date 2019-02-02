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

    prepareDatabaseOptions: function (options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let schema = options.moduleObject.rawSchema[options.schemaName];
                let indexedFields = {};
                let defaultValues = {};
                let jsonSchema = {
                    bsonType: 'object',
                    required: [],
                    properties: {}
                };
                if (schema.definition) {
                    Object.keys(schema.definition).forEach(propertyName => {
                        let property = _.merge({}, schema.definition[propertyName]);
                        jsonSchema.properties[propertyName] = {};
                        if (property.type) {
                            jsonSchema.properties[propertyName].bsonType = property.type;
                            delete property.type;
                        }
                        if (property.required && property.required === true) {
                            jsonSchema.required.push(propertyName);
                            delete property.required;
                        }
                        if (typeof property.default !== 'undefined') {
                            defaultValues[propertyName] = property.default;
                            delete property.default;
                        }
                        if (UTILS.isBlank(property)) {
                            _.merge(jsonSchema.properties[propertyName], property);
                        }
                        if (!property.description) {
                            jsonSchema.properties[propertyName].description = 'must be a ' + jsonSchema.properties[propertyName].bsonType;
                            if (jsonSchema.required.includes(propertyName)) {
                                jsonSchema.properties[propertyName].description += ' and is required';
                            } else {
                                jsonSchema.properties[propertyName].description += ' and is not required';
                            }
                        }

                    });
                }
                if (schema.indexes) {
                    Object.keys(schema.indexes).forEach(propertyName => {
                        let indexConfig = schema.indexes[propertyName];
                        indexedFields[indexConfig.name] = {};
                        indexedFields[indexConfig.name].field = {};
                        indexedFields[indexConfig.name].field[indexConfig.name] = 1;
                        indexedFields[indexConfig.name].options = indexConfig.options;
                    });
                }
                if (!schema.schemaOptions) {
                    schema.schemaOptions = {};
                }
                schema.schemaOptions[options.tntCode] = {
                    options: {
                        validator: {
                            '$jsonSchema': jsonSchema
                        }
                    },
                    indexedFields: indexedFields,
                    defaultValues: defaultValues
                };
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    retrieveModel: function (options, dataBase) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let schema = options.moduleObject.rawSchema[options.schemaName];
            if (dataBase.getCollectionList().includes(options.modelName)) {
                let collection = dataBase.getConnection().collection(options.modelName);
                collection.moduleName = options.moduleName;
                collection.rawSchema = schema;
                collection.modelName = options.modelName;
                collection.schemaName = options.schemaName;
                collection.cache = options.cache;
                collection.dataBase = dataBase;
                collection.tenant = options.tntCode;
                collection.channel = options.channel;
                resolve(collection);
            } else {
                _self.createModel(options, dataBase).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            }
        });
    },

    createModel: function (options, dataBase) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let schema = options.moduleObject.rawSchema[options.schemaName];
            let schemaOptions = schema.schemaOptions[options.tntCode];
            let tmpOptions = schema.options || {};
            if (schemaOptions.options && !UTILS.isBlank(schemaOptions.options)) {
                tmpOptions = _.merge(tmpOptions, schemaOptions.options);
            }
            dataBase.getConnection().createCollection(options.modelName, tmpOptions).then(collection => {
                collection.moduleName = options.moduleName;
                collection.rawSchema = schema;
                collection.modelName = options.modelName;
                collection.schemaName = options.schemaName;
                collection.cache = options.cache;
                collection.dataBase = dataBase;
                collection.tenant = options.tntCode;
                collection.channel = options.channel;
                _self.createIndexes(collection).then(success => {
                    _self.LOG.debug('Indexes created for: ' + collection.schemaName);
                    resolve(collection);
                }).catch(error => {
                    _self.LOG.error('Indexes failed for: ' + collection.schemaName + ' : ' + error);
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    },

    createIndexes: function (model, cleanOrphan) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (model) {
                let schemaOptions = model.rawSchema.schemaOptions[model.tenant];
                let allPromise = [];
                let liveIndexes = {};
                if (!UTILS.isBlank(schemaOptions.indexedFields)) {
                    model.indexes(function (err, indexes) {
                        if (indexes && indexes.length > 0) {
                            let idKeyHash = UTILS.generateHash(JSON.stringify({
                                _id: 1
                            }));
                            indexes.forEach(element => {
                                let key = UTILS.generateHash(JSON.stringify(element.key));
                                if (key != idKeyHash) {
                                    liveIndexes[key] = {
                                        hash: key,
                                        key: element.key,
                                        name: element.name,
                                        unique: element.unique || false
                                    };
                                }
                            });
                        }
                        _.each(schemaOptions.indexedFields, (config, field) => {
                            let key = UTILS.generateHash(JSON.stringify(config.field));
                            let tmpIndex = liveIndexes[key];
                            if (!tmpIndex || tmpIndex.unique !== config.options.unique) {
                                allPromise.push(SYSTEM.createIndex(model, config));
                            } else {
                                delete liveIndexes[key];
                            }
                        });
                        if (cleanOrphan && !UTILS.isBlank(liveIndexes)) {
                            _.each(liveIndexes, (indexConfig, key) => {
                                allPromise.push(SYSTEM.dropIndex(model, indexConfig.name));
                            });
                        }
                        if (allPromise.length > 0) {
                            Promise.all(allPromise).then(success => {
                                let response = {};
                                response[model.schemaName + '_' + model.tenant + '_' + model.channel] = success;
                                resolve(response);
                            }).catch(error => {
                                let response = {};
                                response[model.schemaName + '_' + model.tenant + '_' + model.channel] = error;
                                reject(response);
                            });
                        } else {
                            let response = {};
                            response[model.schemaName + '_' + model.tenant + '_' + model.channel] = 'There are none properties having index value';
                            resolve(response);
                        }
                    });
                } else {
                    let response = {};
                    response[model.schemaName + '_' + model.tenant + '_' + model.channel] = 'There are none properties having index value';
                    resolve(response);
                }
            } else {
                let response = {};
                response[model.schemaName + '_' + model.tenant + '_' + model.channel] = 'Invalid schema value to update indexes';
                reject(response);
            }
        });
    },
};