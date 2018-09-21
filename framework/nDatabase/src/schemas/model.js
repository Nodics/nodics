/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    default: {
        defineDefaultGet: function (collection, rawSchema) {
            collection.getItems = function (input) {
                return new Promise((resolve, reject) => {
                    try {
                        this.find(input.query, input.queryOptions).toArray((error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result);
                            }
                        });
                    } catch (error) {
                        reject(error);
                    }
                });
            };
        },

        defineDefaultSave: function (collection, rawSchema) {
            collection.saveItem = function (input) {
                return new Promise((resolve, reject) => {
                    if (!input.model) {
                        reject('Invalid model value to save');
                    } else {
                        try {
                            let model = input.model;
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
                                    query[property] = value;
                                });
                                this.saveByQuery(query, model).then(result => {
                                    resolve(result);
                                }).catch(error => {
                                    reject(error);
                                });
                            } else if (model._id) {
                                let query = {
                                    _id: model._id
                                };
                                this.saveByQuery(query, model).then(result => {
                                    resolve(result);
                                }).catch(error => {
                                    reject(error);
                                });
                            } else {
                                this.createItem(model).then(result => {
                                    resolve(result);
                                }).catch(error => {
                                    reject(error);
                                });
                            }
                        } catch (error) {
                            reject(error);
                        }
                    }
                });
            };
        },

        defineDefaultSaveByQuery: function (collection, rawSchema) {
            collection.saveByQuery = function (query, model) {
                let modelUpdateOptions = CONFIG.get('database').modelUpdateOptions;
                return new Promise((resolve, reject) => {
                    this.findOneAndUpdate(query, { $set: model }, modelUpdateOptions).then(result => {
                        if (result && result.value) {
                            resolve(result.value);
                        } else {
                            reject('Failed to update doc');
                        }
                    }).catch(error => {
                        console.log(error);
                        reject(error);
                    });
                });
            };
        },

        defineDefaultCreate: function (collection, rawSchema) {
            collection.createItem = function (model) {
                return new Promise((resolve, reject) => {
                    this.insertOne(model, {}).then(result => {
                        if (result.ops && result.ops.length > 0) {
                            resolve(result.ops[0]);
                        } else {
                            reject('Failed to create doc');
                        }
                    }).catch(error => {
                        console.log(error);
                        reject(error);
                    });
                });
            };
        },

        defineDefaultRemove: function (collection, rawSchema) {
            collection.removeItems = function (input) {
                return new Promise((resolve, reject) => {
                    let query = '';
                    if (input.query) {
                        query = input.query;
                    } else {
                        query = {
                            _id: {
                                $in: input.ids
                            }
                        };
                    }
                    this.deleteMany(query, {}).then(response => {
                        resolve(response);
                    }).catch(error => {
                        reject(error);
                    });
                });
            };
        },

        defineDefaultUpdate: function (collection, rawSchema) {
            collection.updateItems = function (query, model) {
                return new Promise((resolve, reject) => {
                    this.updateMany(query, { $set: model }, { upsert: false }).then(result => {
                        resolve(result);
                    }).catch(error => {
                        reject(error);
                    });
                });
            };
        }
    }
};