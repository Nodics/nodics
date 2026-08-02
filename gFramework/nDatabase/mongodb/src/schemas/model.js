/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');

function transactionOptions(input, schemaModel) {
    if (typeof SERVICE === 'undefined' || !SERVICE.DefaultDatabaseTransactionService) {
        return {};
    }
    return SERVICE.DefaultDatabaseTransactionService.operationOptions(
        input.transactionContext, schemaModel.dataBase, schemaModel
    );
}

function isMongoUpdateOperatorPayload(model) {
    return model && Object.keys(model).some(key => key.indexOf('$') === 0);
}

function buildUpdateDocument(model) {
    if (!isMongoUpdateOperatorPayload(model)) return { $set: model };
    return Object.keys(model).reduce((updateDocument, key) => {
        if (key.indexOf('$') === 0) {
            updateDocument[key] = key === '$set'
                ? Object.assign({}, updateDocument[key] || {}, model[key] || {})
                : model[key];
        } else {
            updateDocument.$set = Object.assign({}, updateDocument.$set || {}, { [key]: model[key] });
        }
        return updateDocument;
    }, {});
}

function mergeUpdatedSnapshot(snapshot, model) {
    if (!isMongoUpdateOperatorPayload(model)) return _.merge(snapshot, model);
    if (model.$set) _.merge(snapshot, model.$set);
    if (model.$unset) Object.keys(model.$unset).forEach(key => _.unset(snapshot, key));
    return snapshot;
}

/**
 * @module gFramework/nDatabase/mongodb/src/schemas/model
 * @description Defines nDatabase schema metadata, model contracts, and generated capability settings.
 * @layer schemas
 * @owner nDatabase
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    default: {
        /**
         * Retrieves items information.
         *
         * @param {*} input Method input.
         * @returns {*} Method result.
         */
        getItems: function (input) {
            return new Promise((resolve, reject) => {
                try {
                    let operationOptions = transactionOptions(input, this);
                    let cursor = this.find(input.query, Object.assign({}, input.searchOptions || {}, operationOptions));
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

        /**

         * Updates items information.

         *

         * @param {*} input Method input.

         * @returns {*} Method result.

         */

        saveItems: function (input) {
            return new Promise((resolve, reject) => {
                let operationOptions = transactionOptions(input, this);
                if (!input.model) {
                    reject(new CLASSES.NodicsError('ERR_MDL_00001'));
                } else if (input.query && !UTILS.isBlank(input.query)) {
                    try {
                        this.findOneAndUpdate(input.query,
                            {
                                $set: input.model
                            },
                            Object.assign({}, this.dataBase.getOptions().modelSaveOptions || {
                                upsert: true,
                                returnDocument: 'after'
                            }, operationOptions)).then(result => {
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
                                this.insertOne(input.model, operationOptions).then(result => {
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

        /**

         * Updates items information.

         *

         * @param {*} input Method input.

         * @returns {*} Method result.

         */

        updateItems: function (input) {
            return new Promise((resolve, reject) => {
                let operationOptions = transactionOptions(input, this);
                if (!input.model) {
                    reject(new CLASSES.NodicsError('ERR_MDL_00003'));
                } else if (!input.query || UTILS.isBlank(input.query)) {
                    reject(new CLASSES.NodicsError('ERR_MDL_00003'));
                } else {
                    if (input.options && input.options.returnModified) {
                        this.find(input.query, Object.assign({}, input.searchOptions || {},
                            operationOptions)).toArray((error, response) => {
                            if (error) {
                                reject(new CLASSES.NodicsError(error, null, 'ERR_MDL_00000'));
                            } else {
                                this.updateMany(input.query, buildUpdateDocument(input.model), Object.assign({}, this.dataBase.getOptions().modelUpdateOptions || {
                                    upsert: false,
                                    returnNewDocument: true
                                }, operationOptions)).then(success => {
                                    response.forEach(element => {
                                        mergeUpdatedSnapshot(element, input.model);
                                    });
                                    success.models = response;
                                    resolve(success);
                                }).catch(error => {
                                    const modelError = new CLASSES.NodicsError(error, null, 'ERR_MDL_00000');
                                    modelError.errInfo = error && error.errInfo;
                                    reject(modelError);
                                });
                            }
                        });
                    } else {
                        this.updateMany(input.query, buildUpdateDocument(input.model), Object.assign({}, this.dataBase.getOptions().modelUpdateOptions || {
                            upsert: false,
                            returnNewDocument: true
                        }, operationOptions)).then(success => {
                            resolve(success);
                        }).catch(error => {
                            const modelError = new CLASSES.NodicsError(error, null, 'ERR_MDL_00000');
                            modelError.errInfo = error && error.errInfo;
                            reject(modelError);
                        });
                    }
                }
            });
        },

        /**

         * Removes or clears items information.

         *

         * @param {*} input Method input.

         * @returns {*} Method result.

         */

        removeItems: function (input) {
            return new Promise((resolve, reject) => {
                let operationOptions = transactionOptions(input, this);
                if (input.query && !UTILS.isBlank(input.query)) {
                    if (input.options && input.options.returnModified) {
                        this.find(input.query, Object.assign({}, input.searchOptions || {},
                            operationOptions)).toArray((error, response) => {
                            if (error) {
                                reject(new CLASSES.NodicsError(error, null, 'ERR_MDL_00000'));
                            } else {
                                this.deleteMany(input.query,
                                    Object.assign({}, this.dataBase.getOptions().modelRemoveOptions || {
                                        j: false
                                    }, operationOptions)).then(success => {
                                        let result = success.result || {};
                                        result.models = response;
                                        resolve(result);
                                    }).catch(error => {
                                        reject(new CLASSES.NodicsError(error, null, 'ERR_MDL_00000'));
                                    });
                            }
                        });
                    } else {
                        this.deleteMany(input.query, Object.assign({}, this.dataBase.getOptions().modelRemoveOptions || {
                            j: false
                        }, operationOptions)).then(success => {
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
