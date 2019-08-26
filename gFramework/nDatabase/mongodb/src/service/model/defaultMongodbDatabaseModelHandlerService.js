/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const ObjectId = require('mongodb').ObjectId;

const util = require('util');

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
                let indexedFields = [];
                let defaultValues = {};
                let validators = {};
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
                        if (typeof property.validator !== 'undefined') {
                            validators[propertyName] = property.validator;
                            delete property.validator;
                        }
                        let schemaProperties = options.dataBase.master.getOptions().schemaProperties;
                        if (!UTILS.isBlank(property) && schemaProperties && schemaProperties.length) {
                            schemaProperties.forEach(prop => {
                                if (property[prop] && !UTILS.isBlank(property[prop])) {
                                    jsonSchema.properties[propertyName][prop] = property[prop];
                                }
                            });
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
                    let conpositeIndexes = {
                        fields: {},
                        options: {}
                    };
                    let individualIndexes = [];
                    Object.keys(schema.indexes).forEach(propertyName => {
                        let indexConfig = schema.indexes[propertyName];
                        if (indexConfig.name && indexConfig.enabled) {
                            if (indexConfig.composite) {
                                if (!conpositeIndexes.fields[indexConfig.name]) {
                                    conpositeIndexes.fields[indexConfig.name] = 1;
                                }
                                _.merge(conpositeIndexes.options, indexConfig.options);
                            } else {
                                let tmpIdx = {};
                                tmpIdx[indexConfig.name] = 1;
                                individualIndexes.push({
                                    fields: [tmpIdx],
                                    options: indexConfig.options
                                });
                            }
                        }
                    });
                    if (!UTILS.isBlank(conpositeIndexes.fields)) {
                        indexedFields.push(conpositeIndexes);
                    }
                    if (!UTILS.isBlank(individualIndexes)) {
                        indexedFields = indexedFields.concat(individualIndexes);
                    }
                    // console.log('---------------------------------: ', options.schemaName);
                    // console.log(util.inspect(indexedFields, false, 6));
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
                    defaultValues: defaultValues,
                    validators: validators
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
                let schemaModel = dataBase.getConnection().collection(options.modelName);
                schemaModel.moduleName = options.moduleName;
                schemaModel.rawSchema = schema;
                schemaModel.modelName = options.modelName;
                schemaModel.schemaName = options.schemaName;
                schemaModel.cache = options.cache;
                schemaModel.dataBase = dataBase;
                schemaModel.tenant = options.tntCode;
                schemaModel.channel = options.channel;
                _self.createIndexes(schemaModel).then(success => {
                    _self.LOG.debug('Indexes created for: ' + schemaModel.schemaName);
                    resolve(schemaModel);
                }).catch(error => {
                    _self.LOG.error('Indexes failed for: ' + schemaModel.schemaName + ' : ', error);
                    reject(error);
                });
                resolve(schemaModel);
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
            dataBase.getConnection().createCollection(options.modelName, tmpOptions).then(schemaModel => {
                schemaModel.moduleName = options.moduleName;
                schemaModel.rawSchema = schema;
                schemaModel.modelName = options.modelName;
                schemaModel.schemaName = options.schemaName;
                schemaModel.cache = options.cache;
                schemaModel.dataBase = dataBase;
                schemaModel.tenant = options.tntCode;
                schemaModel.channel = options.channel;
                _self.createIndexes(schemaModel).then(success => {
                    _self.LOG.debug('Indexes created for: ' + schemaModel.schemaName);
                    resolve(schemaModel);
                }).catch(error => {
                    _self.LOG.error('Indexes failed for: ' + schemaModel.schemaName + ' : ', error);
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
            try {
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
                            console.log('----------------: ', liveIndexes);
                            // console.log(util.inspect(schemaOptions.indexedFields, false, 6));
                            if (schemaOptions.indexedFields.length > 0) {
                                for (let counter = 0; counter < schemaOptions.indexedFields.length; counter++) {
                                    let indexData = schemaOptions.indexedFields[counter];
                                    let key = UTILS.generateHash(JSON.stringify(indexData.fields));
                                    console.log(key, ' : ', indexData);

                                    console.log('----------------');
                                }
                            }
                            // _.each(schemaOptions.indexedFields, (config, field) => {
                            //     let key = UTILS.generateHash(JSON.stringify(config.field));
                            //     let tmpIndex = liveIndexes[key];
                            //     if (!tmpIndex || tmpIndex.unique !== config.options.unique) {
                            //         allPromise.push(_self.createIndex(model, config));
                            //     } else {
                            //         delete liveIndexes[key];
                            //     }
                            // });
                            // if (cleanOrphan && !UTILS.isBlank(liveIndexes)) {
                            //     _.each(liveIndexes, (indexConfig, key) => {
                            //         allPromise.push(_self.dropIndex(model, indexConfig.name));
                            //     });
                            // }
                            // if (allPromise.length > 0) {
                            //     Promise.all(allPromise).then(success => {
                            //         let response = {};
                            //         response[model.schemaName + '_' + model.tenant + '_' + model.channel] = success;
                            //         resolve(response);
                            //     }).catch(error => {
                            //         let response = {};
                            //         response[model.schemaName + '_' + model.tenant + '_' + model.channel] = error;
                            //         reject(response);
                            //     });
                            // } else {
                            //     let response = {};
                            //     response[model.schemaName + '_' + model.tenant + '_' + model.channel] = 'There are none properties having index value';
                            //     resolve(response);
                            // }
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
            } catch (error) {
                reject(error);
            }
        });
    },

    createIndex: function (model, indexConfig) {
        return new Promise((resolve, reject) => {
            try {
                console.log('############################: ', indexConfig.field);
                model.dataBase.getConnection().createIndex(model.modelName, [indexConfig.field, 'versionId'], indexConfig.options).then(success => {
                    resolve('Index updated for ' + Object.keys(indexConfig.field)[0]);
                }).catch(error => {
                    reject('Index failed for ' + Object.keys(indexConfig.field)[0] + ' : ' + error.toString());
                });
            } catch (error) {
                reject('Index failed for ' + Object.keys(indexConfig.field)[0] + ' : ' + error.toString());
            }
        });
    },

    dropIndex: function (model, indexName) {
        return new Promise((resolve, reject) => {
            try {
                model.dropIndex(indexName).then(success => {
                    resolve('Index deleted for ' + indexName);
                }).catch(error => {
                    reject('Index deleting failed for ' + indexName + ' : ' + error.toString());
                });
            } catch (error) {
                reject('Index deleting failed for ' + indexName + ' : ' + error.toString());
            }
        });
    },

    updateValidator: function (model) {
        return new Promise((resolve, reject) => {
            let schema = model.rawSchema;
            let schemaOptions = model.rawSchema.schemaOptions[model.tenant];
            let tmpOptions = { collMod: model.modelName };
            tmpOptions = _.merge(tmpOptions, schema.options || {});
            if (schemaOptions.options && !UTILS.isBlank(schemaOptions.options)) {
                tmpOptions = _.merge(tmpOptions, schemaOptions.options);
            }
            model.dataBase.getConnection().command(tmpOptions).then(success => {
                let response = {};
                response[model.schemaName + '_' + model.tenant + '_' + model.channel] = 'Validator updated';
                resolve(response);
            }).catch(error => {
                let response = {};
                response[model.schemaName + '_' + model.tenant + '_' + model.channel] = 'Validator update failed';
                reject(response);
            });
        });
    },

    toObjectId: function (id) {
        return ObjectId(id);
    }
};