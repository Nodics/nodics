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

/**
 * @module mongodb/service/model/DefaultMongodbDatabaseModelHandlerService
 * @description MongoDB implementation of the Nodics database model handler
 * contract. It converts effective schemas into MongoDB jsonSchema validators,
 * collection options, indexes, collection wrappers, and ObjectId values.
 * @layer service
 * @owner nDatabase
 * @override Project modules may override this adapter to customize MongoDB
 * model generation, index reconciliation, validator updates, or id conversion
 * while preserving generic model handler inputs and outputs.
 *
 * @property {Object} options.moduleObject.rawSchema Effective schema registry for the owning module.
 * @property {Object} options.dataBase.master Master database wrapper.
 * @property {Object} model.rawSchema Effective schema definition attached to generated collection wrappers.
 */
module.exports = {
    /**
     * Initializes the MongoDB model handler.
     *
     * @param {Object} options Startup options supplied by the module initializer.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the MongoDB model handler.
     *
     * @param {Object} options Startup options supplied by the module initializer.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Converts an effective Nodics schema into MongoDB collection options.
     *
     * @param {Object} options Model build context.
     * @param {Object} options.moduleObject Active module object with `rawSchema`.
     * @param {string} options.schemaName Schema code.
     * @param {string} options.tntCode Tenant code.
     * @param {Object} options.dataBase Tenant database handle map.
     * @returns {Promise<boolean>} Resolves after schema options are attached to the raw schema.
     * @sideEffects Writes `schema.schemaOptions[tenant]` including validators, defaults, and indexes.
     * @throws {CLASSES.NodicsError} When schema primary key/versioning constraints are invalid.
     */
    prepareDatabaseOptions: function (options) {
        return new Promise((resolve, reject) => {
            try {
                let schema = options.moduleObject.rawSchema[options.schemaName];
                let allIndexes = [];
                let primaryKeys = [];
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
                        if (property.required) {
                            jsonSchema.required.push(propertyName);
                            delete property.required;
                        }
                        if (property.primary) {
                            primaryKeys.push(propertyName);
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
                if (primaryKeys.length > 1) {
                    reject(new CLASSES.NodicsError('ERR_DBS_00000', 'Multiple primary keys are not supported: ' + primaryKeys.length));
                } else if (schema.versioned && primaryKeys.length <= 0) {
                    reject(new CLASSES.NodicsError('ERR_DBS_00000', 'Versioned schema: ' + options.schemaName + ' without primary keys not valid'));
                } else {
                    let individualIndexes = [];
                    if (primaryKeys.length > 0) {
                        primaryKeys.forEach(key => {
                            let tmpIndex = {
                                fields: {},
                                options: {
                                    unique: true
                                }
                            };
                            tmpIndex.fields[key] = 1;
                            allIndexes.push(key);
                            individualIndexes.push(tmpIndex);
                        });
                    }
                    if (schema.indexes) {
                        let commonIndexes = {
                            fields: {},
                            options: {}
                        };
                        let conpositeIndexes = {
                            fields: {},
                            options: {}
                        };
                        if (!UTILS.isBlank(schema.indexes.common)) {
                            Object.keys(schema.indexes.common).forEach(commonIndexName => {
                                let commonIndexData = schema.indexes.common[commonIndexName];
                                if (commonIndexData.enabled && !allIndexes.includes(commonIndexData.name)) {
                                    commonIndexes.fields[commonIndexData.name] = 1;
                                    _.merge(commonIndexes.options, commonIndexData.options);
                                    if (!primaryKeys.includes(commonIndexData.name)) {
                                        primaryKeys.push(commonIndexData.name);
                                    }
                                }
                            });
                        }
                        if (!UTILS.isBlank(schema.indexes.composite)) {
                            Object.keys(schema.indexes.composite).forEach(compositeIndexName => {
                                let compositeIndexData = schema.indexes.composite[compositeIndexName];
                                if (compositeIndexData.enabled && !allIndexes.includes(compositeIndexData.name)) {
                                    conpositeIndexes.fields[compositeIndexData.name] = 1;
                                    _.merge(conpositeIndexes.options, compositeIndexData.options);
                                    if (!primaryKeys.includes(compositeIndexData.name)) {
                                        primaryKeys.push(compositeIndexData.name);
                                    }
                                }
                            });
                        }
                        if (!UTILS.isBlank(schema.indexes.individual)) {
                            Object.keys(schema.indexes.individual).forEach(individualIndexName => {
                                let individualIndexData = schema.indexes.individual[individualIndexName];
                                if (individualIndexData.enabled && !allIndexes.includes(individualIndexData.name)) {
                                    let tmpIndex = {
                                        fields: {},
                                        options: {}
                                    };
                                    tmpIndex.fields[individualIndexData.name] = 1;
                                    _.merge(tmpIndex.options, individualIndexData.options);
                                    individualIndexes.push(tmpIndex);
                                    if (!primaryKeys.includes(individualIndexData.name)) {
                                        primaryKeys.push(individualIndexData.name);
                                    }
                                }
                            });
                        }

                        if (!UTILS.isBlank(commonIndexes.fields)) {
                            if (!UTILS.isBlank(conpositeIndexes.fields)) {
                                _.merge(conpositeIndexes, commonIndexes);
                            }
                            if (individualIndexes.length > 0) {
                                individualIndexes.forEach(individualIndexe => {
                                    _.merge(individualIndexe, commonIndexes);
                                });
                            }
                        }
                        if (!UTILS.isBlank(conpositeIndexes.fields)) {
                            indexedFields.push(conpositeIndexes);
                        }
                        if (individualIndexes && individualIndexes.length > 0) {
                            indexedFields = indexedFields.concat(individualIndexes);
                        }
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
                        primaryKeys: primaryKeys,
                        indexedFields: indexedFields,
                        defaultValues: defaultValues,
                        validators: validators
                    };
                    resolve(true);
                }
            } catch (error) {
                reject(new CLASSES.NodicsError(error, 'while preparing database options', 'ERR_DBS_00000'));
            }
        });
    },

    /**
     * Retrieves an existing collection model or creates it when absent.
     *
     * @param {Object} options Model build context.
     * @param {Object} dataBase Nodics database wrapper.
     * @returns {Promise<Object>} Generated MongoDB collection wrapper.
     * @sideEffects Creates missing indexes on existing collections.
     */
    retrieveModel: function (options, dataBase) {
        let _self = this;
        return new Promise((resolve, reject) => {
            let schema = options.moduleObject.rawSchema[options.schemaName];
            let schemaOptions = schema.schemaOptions[options.tntCode];
            if (dataBase.getCollectionList().includes(options.modelName)) {
                let schemaModel = dataBase.getConnection().collection(options.modelName);
                schemaModel.moduleName = options.moduleName;
                schemaModel.versioned = schema.versioned || false;
                schemaModel.rawSchema = schema;
                schemaModel.modelName = options.modelName;
                schemaModel.schemaName = options.schemaName;
                schemaModel.cache = options.cache;
                schemaModel.dataBase = dataBase;
                schemaModel.tenant = options.tntCode;
                schemaModel.channel = options.channel;
                if (schemaOptions.primaryKeys && schemaOptions.primaryKeys.length > 0) {
                    schemaModel.primaryKey = schemaOptions.primaryKeys[0];
                }
                _self.createIndexes(schemaModel).then(success => {
                    _self.LOG.debug('Indexes created for: ' + schemaModel.schemaName);
                    resolve(schemaModel);
                }).catch(error => {
                    _self.LOG.error('Indexes failed for: ' + schemaModel.schemaName + ' : ', error);
                    reject(new CLASSES.NodicsError(error, 'Indexes failed for: ' + schemaModel.schemaName, 'ERR_DBS_00000'));
                });
            } else {
                _self.createModel(options, dataBase).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            }
        });
    },

    /**
     * Creates a MongoDB collection for a generated schema model.
     *
     * @param {Object} options Model build context.
     * @param {Object} dataBase Nodics database wrapper.
     * @returns {Promise<Object>} Generated MongoDB collection wrapper.
     * @sideEffects Creates collection and configured indexes.
     */
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
                schemaModel.versioned = schema.versioned || false;
                schemaModel.rawSchema = schema;
                schemaModel.modelName = options.modelName;
                schemaModel.schemaName = options.schemaName;
                schemaModel.cache = options.cache;
                schemaModel.dataBase = dataBase;
                schemaModel.tenant = options.tntCode;
                schemaModel.channel = options.channel;
                if (schemaOptions.primaryKeys && schemaOptions.primaryKeys.length > 0) {
                    schemaModel.primaryKey = schemaOptions.primaryKeys[0];
                }
                _self.createIndexes(schemaModel).then(success => {
                    if (success.success) {
                        _self.LOG.info('Successfully updated indexes');
                        _self.LOG.info(success.success);
                    }
                    if (success.errors) {
                        _self.LOG.info('Failed updating indexes');
                        _self.LOG.info(success.errors);
                    }
                    resolve(schemaModel);
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(new CLASSES.NodicsError(error, null, 'ERR_DBS_00005'));
            });
        });
    },

    /**
     * Reconciles MongoDB indexes for one generated model.
     *
     * @param {Object} model Generated MongoDB collection wrapper.
     * @param {boolean} cleanOrphan Whether unknown live indexes should be dropped.
     * @returns {Promise<Object>} Aggregated index create/drop response.
     * @throws {CLASSES.NodicsError} When index discovery or mutation fails.
     */
    createIndexes: function (model, cleanOrphan) {
        let _self = this;
        cleanOrphan = cleanOrphan || CONFIG.get('database').default.options.cleanOrphan;
        return new Promise((resolve, reject) => {
            try {
                if (model) {
                    let databaseOptions = model.dataBase.getOptions();
                    let schemaOptions = model.rawSchema.schemaOptions[model.tenant];
                    if (!UTILS.isBlank(schemaOptions.indexedFields)) {
                        model.indexes(function (err, indexes) {
                            if (databaseOptions.defaultIndexes && databaseOptions.defaultIndexes.length > 0 && indexes && indexes.length > 0) {
                                databaseOptions.defaultIndexes.forEach(property => {
                                    let tmpKey = {};
                                    tmpKey[property] = 1;
                                    for (let counter = 0; counter < indexes.length; counter++) {
                                        if (_.isEqual(indexes[counter].key, tmpKey)) {
                                            indexes.splice(counter, 1);
                                        }
                                    }
                                });
                            }
                            let finalIndexes = _self.finalizeIndexes(schemaOptions.indexedFields, indexes, cleanOrphan);
                            let allPromises = [];
                            if (finalIndexes.create && finalIndexes.create.length > 0) {
                                finalIndexes.create.forEach(indexData => {
                                    allPromises.push(_self.createIndex(model, indexData));
                                });
                            }
                            if (finalIndexes.drop && finalIndexes.drop.length > 0) {
                                finalIndexes.drop.forEach(name => {
                                    allPromises.push(_self.dropIndex(model, name));
                                });
                            }
                            if (allPromises.length > 0) {
                                SERVICE.DefaultNodicsPromiseService.all(allPromises).then(success => {
                                    resolve(success);
                                }).catch(error => {
                                    reject(error);
                                });
                            } else {
                                resolve({});
                            }
                        });
                    } else {
                        let response = {};
                        response[model.schemaName + '_' + model.tenant + '_' + model.channel] = 'There are none properties having index value';
                        resolve(response);
                    }
                } else {
                    reject(new CLASSES.NodicsError('ERR_DBS_00003', 'Invalid schema value to update indexes'));
                }
            } catch (error) {
                reject(new CLASSES.NodicsError(error, 'while creating indexes for model: ' + model.schemaName, 'ERR_DBS_00000'));
            }
        });
    },

    /**
     * Compares desired schema indexes with live MongoDB indexes.
     *
     * @param {Object[]} indexedFields Desired index definitions from schema options.
     * @param {Object[]} indexes Live MongoDB index definitions.
     * @param {boolean} cleanOrphan Whether remaining live indexes should be dropped.
     * @returns {Object} Index plan containing `create` and optional `drop` entries.
     */
    finalizeIndexes: function (indexedFields, indexes, cleanOrphan) {
        let _self = this;
        let finalIndexes = {};
        if (indexedFields.length > 0) {
            finalIndexes.create = [];
            for (let counter = 0; counter < indexedFields.length; counter++) {
                let indexData = indexedFields[counter];
                if (!_self.isIndexLive(indexData.fields, indexes)) {
                    finalIndexes.create.push(indexData);
                }
            }
        }

        if (cleanOrphan && indexes && indexes.length > 0) {
            finalIndexes.drop = [];
            for (let counter = 0; counter < indexes.length; counter++) {
                finalIndexes.drop.push(indexes[counter].name);
            }
        }

        return finalIndexes;
    },

    /**
     * Determines whether a desired index already exists in the live index list.
     *
     * @param {Object} key Desired MongoDB index key.
     * @param {Object[]} liveIndex Mutable live index list.
     * @returns {boolean} True when the desired index already exists.
     * @sideEffects Removes matched live index entries from `liveIndex`.
     */
    isIndexLive: function (key, liveIndex) {
        let available = false;
        if (liveIndex && liveIndex.length > 0) {
            for (let counter = 0; counter < liveIndex.length; counter++) {
                if (_.isEqual(liveIndex[counter].key, key)) {
                    available = true;
                    liveIndex.splice(counter, 1);
                    break;
                }
            }
        }
        return available;
    },

    /**
     * Creates one MongoDB index for a generated model.
     *
     * @param {Object} model Generated MongoDB collection wrapper.
     * @param {Object} indexConfig Index fields and options.
     * @returns {Promise<string>} Success message for the index operation.
     * @throws {CLASSES.NodicsError} When MongoDB index creation fails.
     */
    createIndex: function (model, indexConfig) {
        return new Promise((resolve, reject) => {
            try {
                model.dataBase.getConnection().createIndex(model.modelName, indexConfig.fields, indexConfig.options).then(success => {
                    resolve('Index updated for model: ' + model.modelName + ', properties: ' + Object.keys(indexConfig.fields));
                }).catch(error => {
                    reject(new CLASSES.NodicsError(error, 'Index create failed for ' + Object.keys(indexConfig.fields), 'ERR_DBS_00006'));
                });
            } catch (error) {
                reject(new CLASSES.NodicsError(error, 'Index create failed for ' + Object.keys(indexConfig.fields), 'ERR_DBS_00006'));
            }
        });
    },

    /**
     * Drops one MongoDB index for a generated model.
     *
     * @param {Object} model Generated MongoDB collection wrapper.
     * @param {string} indexName Live index name.
     * @returns {Promise<string>} Success message for the drop operation.
     * @throws {CLASSES.NodicsError} When MongoDB index removal fails.
     */
    dropIndex: function (model, indexName) {
        return new Promise((resolve, reject) => {
            try {
                model.dropIndex(indexName).then(success => {
                    resolve('Index drop for model: ' + model.modelName + ', propertie: ' + indexName);
                }).catch(error => {
                    reject(new CLASSES.NodicsError(error, 'Index drop failed for ' + indexName, 'ERR_DBS_00007'));
                });
            } catch (error) {
                reject(new CLASSES.NodicsError(error, 'Index drop failed for ' + indexName, 'ERR_DBS_00007'));
            }
        });
    },

    /**
     * Updates MongoDB collection validator options for a generated model.
     *
     * @param {Object} model Generated MongoDB collection wrapper.
     * @returns {Promise<Object>} Validator update response keyed by schema/tenant/channel.
     * @throws {CLASSES.NodicsError|Object} When model is missing or MongoDB rejects the command.
     */
    updateValidator: function (model) {
        return new Promise((resolve, reject) => {
            if (model) {
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
            } else {
                reject(new CLASSES.NodicsError('ERR_DBS_00003', 'model can not be null to update validators'));
            }
        });
    },

    /**
     * Converts a raw id into a MongoDB ObjectId.
     *
     * @param {string|Object} id Raw id value.
     * @returns {ObjectId} MongoDB ObjectId instance.
     */
    toObjectId: function (id) {
        return ObjectId(id);
    }
};
