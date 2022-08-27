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
        getItems: function (input) {
            return new Promise((resolve, reject) => {
                try {
                    let cursor = this.find(input.query, input.searchOptions);
                    if (input.searchOptions && input.searchOptions.sort && !UTILS.isBlank(input.searchOptions.sort)) {
                        cursor = cursor.sort(input.searchOptions.sort);
                    }
                    cursor.count().then(count => {
                        cursor.toArray((error, result) => {
                            if (error) {
                                reject(new CLASSES.NodicsError(error, null, 'ERR_MDL_00000'));
                            } else {
                                resolve({
                                    options: input.searchOptions,
                                    query: input.query,
                                    count: count,
                                    result: result
                                });
                            }
                        });
                    }).catch(error => {
                        reject(new CLASSES.NodicsError(error, 'While executing count operation', 'ERR_MDL_00000'));
                    });
                } catch (error) {
                    reject(new CLASSES.NodicsError(error, 'While executing find operation', 'ERR_MDL_00000'));
                }
            });
        },

        saveItems: function (input) {
            return new Promise((resolve, reject) => {
                if (!input.model) {
                    reject(new CLASSES.NodicsError('ERR_MDL_00001'));
                } else if (input.query && !UTILS.isBlank(input.query)) {
                    try {
                        this.findOneAndUpdate(input.query,
                            {
                                $set: input.model
                            },
                            this.dataBase.getOptions().modelSaveOptions || {
                                upsert: true,
                                returnNewDocument: true
                            }).then(result => {
                                if (result && result.ok > 0 && result.value) {
                                    resolve(result.value);
                                } else if (result && result.ok > 0) {
                                    resolve(_.merge({
                                        _id: result.lastErrorObject.upserted
                                    }, input.model));
                                } else {
                                    reject(new CLASSES.NodicsError('ERR_MDL_00005'));
                                }
                            }).catch(error => {
                                reject(error);
                            });
                    } catch (error) {
                        reject(new CLASSES.NodicsError(error, 'While saving items', 'ERR_MDL_00000'));
                    }
                } else {
                    try {
                        SERVICE.DefaultModelValidatorService.validateMandate(input.model, this.rawSchema).then((success) => {
                            return SERVICE.DefaultModelValidatorService.validateDataType(input.model, this.rawSchema);
                        }).then((success) => {
                            return new Promise((resolve, reject) => {
                                this.insertOne(input.model, {}).then(result => {
                                    if (result.acknowledged || (result.ops && result.ops.length > 0)) {
                                        input.model._id = result.insertedId;
                                        resolve(input.model);
                                    } else {
                                        reject(new CLASSES.NodicsError('ERR_MDL_00005'));
                                    }
                                }).catch(error => {
                                    reject(error);
                                });
                            });
                        }).then((success) => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        });
                    } catch (error) {
                        reject(new CLASSES.NodicsError(error, 'While saving new items', 'ERR_MDL_00000'));
                    }
                }
            });
        },

        updateItems: function (input) {
            return new Promise((resolve, reject) => {
                if (!input.model) {
                    reject(new CLASSES.NodicsError('ERR_MDL_00003'));
                } else if (!input.query || UTILS.isBlank(input.query)) {
                    reject(new CLASSES.NodicsError('ERR_MDL_00003'));
                } else {
                    if (input.options && input.options.returnModified) {
                        this.find(input.query, input.searchOptions || {}).toArray((error, response) => {
                            if (error) {
                                reject(new CLASSES.NodicsError(error, null, 'ERR_MDL_00000'));
                            } else {
                                this.updateMany(input.query, {
                                    $set: input.model
                                }, this.dataBase.getOptions().modelUpdateOptions || {
                                    upsert: false,
                                    returnNewDocument: true
                                }).then(success => {
                                    let result = success.result;
                                    response.forEach(element => {
                                        _.merge(element, input.model);
                                    });
                                    result.models = response;
                                    resolve(result);
                                }).catch(error => {
                                    reject(new CLASSES.NodicsError(error, null, 'ERR_MDL_00000'));
                                });
                            }
                        });
                    } else {
                        this.updateMany(input.query, {
                            $set: input.model
                        }, this.dataBase.getOptions().modelUpdateOptions || {
                            upsert: false,
                            returnNewDocument: true
                        }).then(success => {
                            resolve(success.result);
                        }).catch(error => {
                            reject(new CLASSES.NodicsError(error, null, 'ERR_MDL_00000'));
                        });
                    }
                }
            });
        },

        removeItems: function (input) {
            return new Promise((resolve, reject) => {
                if (input.query && !UTILS.isBlank(input.query)) {
                    if (input.options && input.options.returnModified) {
                        this.find(input.query, input.searchOptions).toArray((error, response) => {
                            if (error) {
                                reject(new CLASSES.NodicsError(error, null, 'ERR_MDL_00000'));
                            } else {
                                this.deleteMany(input.query,
                                    this.dataBase.getOptions().modelRemoveOptions || {
                                        j: false
                                    }).then(success => {
                                        let result = success.result;
                                        result.models = response;
                                        resolve(result);
                                    }).catch(error => {
                                        reject(new CLASSES.NodicsError(error, null, 'ERR_MDL_00000'));
                                    });
                            }
                        });
                    } else {
                        this.deleteMany(input.query, this.dataBase.getOptions().modelRemoveOptions || {
                            j: false
                        }).then(success => {
                            resolve(success.result);
                        }).catch(error => {
                            reject(new CLASSES.NodicsError(error, null, 'ERR_MDL_00000'));
                        });
                    }
                } else {
                    reject(new CLASSES.NodicsError('ERR_MDL_00003'));
                }
            });
        }
    }
};