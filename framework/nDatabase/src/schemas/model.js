/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
//const ObjectId = require('mongodb').ObjectId;

module.exports = {
    default: {
        defineDefaultGet: function (model, rawSchema) {
            model.getItems = function (input) {
                return new Promise((resolve, reject) => {
                    if (!input.options) {
                        input.options = {};
                    }
                    this.find(input.options.query || {}, {}).toArray((error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    });
                });
            }
        },

        defineDefaultSave: function (model, rawSchema) {
            model.saveItems = function (input) {
                return new Promise((resolve, reject) => {
                    if (!input.models) {
                        reject('Invalid list of models to save');
                    } else {
                        try {
                            this.saveAllItems(input, [].concat(input.models), [], (error, result) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(result);
                                }
                            });
                        } catch (error) {
                            reject(error);
                        }
                    }
                });
            }
        },

        defineDefaultSaveAll: function (model, rawSchema) {
            model.saveAllItems = function (input, models, success, callback) {
                let model = models.shift();
                if (input.query && !UTILS.isBlank(input.query)) {
                    let query = _.merge({}, input.query);
                    _.each(query, (propertyName, property) => {
                        let value = '';
                        if (propertyName.indexOf('.') > 0) {
                            let propertyNames = propertyName.split('.');
                            value = model;
                            propertyNames.forEach(element => {
                                if (value[element]) {
                                    value = value[element];
                                } else {
                                    throw new Error('Invalid property value for: ' + property + ' in ' + JSON.stringify(model));
                                }
                            });
                        } else {
                            value = model[propertyName];
                        }
                        query[property] = propertyName;
                    });
                    this.saveByQuery(query, model, success, callback);
                } else if (model._id) {
                    let query = {
                        _id: model._id
                    }
                    this.saveByQuery(query, model, success, callback);
                } else {
                    this.create(model, callback);
                }
            }
        },

        defineDefaultSaveByQuery: function (model, rawSchema) {
            model.saveByQuery = function (query, model, success, callback) {
                this.findOneAndUpdate(query, { $set: model }, { upsert: true }).then(result => {
                    model._id = result.upserted;
                    success.push(model);
                    if (models.length > 0) {
                        this.saveAll(input, models, success, callback);
                    } else {
                        callback(null, success);
                    }
                }).catch(error => {
                    callback(error);
                })

            }
        },

        defineDefaultCreate: function (model, rawSchema) {
            model.create = function (model, callback) {
                this.insertOne(model, {}).then(result => {
                    callback(null, result);
                }).catch(error => {
                    callback(error);
                })

            }
        },

        defineDefaultRemove: function (model, rawSchema) {
            model.remove = function (input) {
                return new Promise((resolve, reject) => {
                    let query = '';
                    if (input.query) {
                        query = input.query;
                    } else {
                        query = {
                            _id: {
                                $in: input.ids
                            }
                        }
                    }
                    this.deleteMany(query, {}).then(response => {
                        resolve(response);
                    }).catch(error => {
                        reject(error);
                    });
                });
            }
        }
    }
};