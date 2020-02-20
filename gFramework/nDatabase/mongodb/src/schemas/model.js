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
                                returnOriginal: false
                            }).then(result => {
                                if (result && result.value) {
                                    resolve(result.value);
                                } else {
                                    reject(new CLASSES.NodicsError('ERR_MDL_00002'));
                                }
                            }).catch(error => {
                                reject(error);
                            });
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    try {
                        SERVICE.DefaultModelValidatorService.validateMandate(input.model, this.rawSchema).then((success) => {
                            return SERVICE.DefaultModelValidatorService.validateDataType(input.model, this.rawSchema);
                        }).then((success) => {
                            return new Promise((resolve, reject) => {
                                this.insertOne(input.model, {}).then(result => {
                                    if (result.ops && result.ops.length > 0) {
                                        resolve(result.ops[0]);
                                    } else {
                                        reject(new CLASSES.NodicsError('ERR_MDL_00002'));
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
                        reject(error);
                    }
                }
            });
        },

        updateItems: function (input) {
            return new Promise((resolve, reject) => {
                if (!input.model) {
                    reject(new CLASSES.NodicsError('ERR_MDL_00001'));
                } else if (!input.query || UTILS.isBlank(input.query)) {
                    reject(new CLASSES.NodicsError('ERR_MDL_00003'));
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
        },

        removeItems: function (input) {
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
                    reject(new CLASSES.NodicsError('ERR_MDL_00003'));
                }
            });
        }
    }
};