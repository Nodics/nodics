/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const util = require('util');

module.exports = {
    default: {
        defineDefaultGet: function (collection, rawSchema) {
            collection.getItems = function (input) {
                return new Promise((resolve, reject) => {
                    try {
                        this.find(input.query, input.options).toArray((error, result) => {
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
            collection.saveItems = function (input) {
                //console.log('==========: ', util.inspect(input.model, true, 6));
                return new Promise((resolve, reject) => {
                    if (!input.model) {
                        reject('Invalid model value to save');
                    } else if (input.query && !UTILS.isBlank(input.query)) {
                        try {
                            this.findOneAndUpdate(input.query,
                                {
                                    $set: input.model
                                },
                                this.dataBase.getOptions().modelSaveOptions || {
                                    upsert: true,
                                    returnOriginal: false
                                }).then(result => {
                                    if (result && result.value) {
                                        resolve(result.value);
                                    } else {
                                        reject('Failed to update doc, Please check your modelSaveOptions');
                                    }
                                }).catch(error => {
                                    reject(error);
                                });
                        } catch (error) {
                            reject(error);
                        }
                    } else {
                        try {
                            this.insertOne(input.model, {}).then(result => {
                                if (result.ops && result.ops.length > 0) {
                                    resolve(result.ops[0]);
                                } else {
                                    reject('Failed to create doc, , Please check your modelSaveOptions');
                                }
                            }).catch(error => {
                                reject(error);
                            });
                        } catch (error) {
                            reject(error);
                        }
                    }
                });
            };
        },

        defineDefaultSaveByQuery: function (collection, rawSchema) {
            collection.updateItems = function (input) {
                return new Promise((resolve, reject) => {
                    if (!input.model) {
                        reject('Invalid model value to save');
                    } else if (!input.query || UTILS.isBlank(input.query)) {
                        reject('Blank query is not supported');
                    } else {
                        if (input.options && input.options.returnModified) {
                            this.find(input.query, input.options).toArray((error, response) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    this.updateMany(input.query,
                                        {
                                            $set: input.model
                                        }, this.dataBase.getOptions().modelUpdateOptions || {
                                            upsert: false,
                                            returnOriginal: false
                                        }).then(success => {
                                            let result = success.result;
                                            response.forEach(element => {
                                                _.merge(element, input.model);
                                            });
                                            result.models = response;
                                            resolve(result);
                                        }).catch(error => {
                                            reject(error);
                                        });
                                }
                            });
                        } else {
                            this.updateMany(input.query,
                                {
                                    $set: input.model
                                },
                                this.dataBase.getOptions().modelUpdateOptions || {
                                    upsert: false,
                                    returnOriginal: false
                                }).then(success => {
                                    resolve(success.result);
                                }).catch(error => {
                                    reject(error);
                                });
                        }
                    }
                });
            };
        },

        defineDefaultRemove: function (collection, rawSchema) {
            collection.removeItems = function (input) {
                return new Promise((resolve, reject) => {
                    if (input.query && !UTILS.isBlank(input.query)) {
                        if (input.options && input.options.returnModified) {
                            this.find(input.query, input.options).toArray((error, response) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    this.deleteMany(input.query,
                                        this.dataBase.getOptions().modelRemoveOptions || {
                                            j: false
                                        }).then(success => {
                                            let result = success.result;
                                            result.models = response;
                                            resolve(result);
                                        }).catch(error => {
                                            reject(error);
                                        });
                                }
                            });
                        } else {
                            this.deleteMany(input.query, this.dataBase.getOptions().modelRemoveOptions || {
                                j: false
                            }).then(success => {
                                resolve(success.result);
                            }).catch(error => {
                                reject(error);
                            });
                        }
                    } else {
                        reject('Blank query is not supported');
                    }
                });
            };
        }
    }
};