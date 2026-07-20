/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module gFramework/nDatabase/mongodb/vMongodb/src/schemas/model
 * @description Defines nDatabase schema metadata, model contracts, and generated capability settings.
 * @layer schemas
 * @owner nDatabase
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    default: {
        /**
         * Normalizes MongoDB getItems responses for versioned model operations.
         *
         * @param {*} response getItems response or direct item array.
         * @returns {Object[]} Matched items.
         */
        getMatchedItems: function (response) {
            if (Array.isArray(response)) {
                return response;
            }
            if (response && Array.isArray(response.result)) {
                return response.result;
            }
            return [];
        },

        /**
         * Validates model rules.
         *
         * @param {*} query Method input.
         * @param {*} searchOptions Method input.
         * @param {*} model Method input.
         * @returns {*} Method result.
         */
        validateModel: function (query, searchOptions, model) {
            return new Promise((resolve, reject) => {
                if (!model) {
                    reject(new CLASSES.NodicsError('ERR_MDL_00001'));
                } else if (model.versionId === undefined || model.versionId < 0) {
                    reject(new CLASSES.NodicsError('ERR_MDL_00004'));
                }
                try {
                    let customQuery = _.merge({}, query);
                    let customOptions = _.merge(_.merge({}, searchOptions), {
                        limit: 1,
                        sort: { versionId: -1 },
                        projection: { _id: 0 }
                    });
                    this.getItems({
                        query: customQuery,
                        searchOptions: customOptions
                    }).then(success => {
                        let matchedItems = this.getMatchedItems(success);
                        if (matchedItems.length > 0) {
                            let preMoidel = matchedItems[0];
                            preMoidel.versionId = (preMoidel.versionId === undefined) ? -1 : preMoidel.versionId;
                            if (model.versionId <= preMoidel.versionId) {
                                reject(new CLASSES.NodicsError('ERR_MDL_00004', model.versionId + ', it should be: ' + (preMoidel.versionId + 1)));
                            } else {
                                model.versionId = preMoidel.versionId + 1;
                                resolve(_.merge(preMoidel, model));
                            }
                        } else {
                            if (model.versionId > 0) {
                                reject(new CLASSES.NodicsError('ERR_MDL_00004', model.versionId + ', it should be: 0'));
                            } else {
                                resolve(model);
                            }
                        }
                    }).catch(error => {
                        reject(error);
                    });
                } catch (error) {
                    reject(error);
                }
            });
        },

        /**

         * Updates versioned items information.

         *

         * @param {*} input Method input.

         * @returns {*} Method result.

         */

        saveVersionedItems: function (input) {
            let _self = this;
            return new Promise((resolve, reject) => {
                try {
                    _self.validateModel(input.query, input.searchOptions, input.model).then(model => {
                        _self.insertOne(model, {}).then(result => {
                            if (result.ops && result.ops.length > 0) {
                                resolve(result.ops[0]);
                            } else if (result && result.acknowledged === true && result.insertedId) {
                                resolve(Object.assign({}, model, { _id: model._id || result.insertedId }));
                            } else {
                                reject(new CLASSES.NodicsError('ERR_MDL_00002'));
                            }
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } catch (error) {
                    reject(error);
                }
            });
        },

        /**

         * Retrieves previous items information.

         *

         * @param {*} matchedItems Method input.

         * @param {*} newItem Method input.

         * @param {*} finalizeData Method input.

         * @returns {*} Method result.

         */

        fetchPreviousItems: function (matchedItems, newItem, finalizeData) {
            let _self = this;
            return new Promise((resolve, reject) => {
                try {
                    if (matchedItems && matchedItems.length > 0) {
                        let currentMatchedItem = matchedItems.shift();
                        let customQuery = {};
                        customQuery[_self.primaryKey] = currentMatchedItem[_self.primaryKey];
                        this.getItems({
                            query: customQuery,
                            searchOptions: {
                                limit: 1,
                                sort: { versionId: -1 },
                                projection: { _id: 0 }
                        }
                    }).then(success => {
                            let previousItems = _self.getMatchedItems(success);
                            if (previousItems.length > 0) {
                                let data = _.merge(previousItems[0], newItem);
                                data.versionId = (data.versionId === undefined) ? 1 : data.versionId + 1;
                                finalizeData.push(data);
                            }
                            _self.fetchPreviousItems(matchedItems, newItem, finalizeData).then(success => {
                                resolve(true);
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        resolve(true);
                    }
                } catch (error) {
                    reject(error);
                }
            });

        },

        /**

         * Updates versioned items information.

         *

         * @param {*} input Method input.

         * @returns {*} Method result.

         */

        updateVersionedItems: function (input) {
            let _self = this;
            return new Promise((resolve, reject) => {
                try {
                    _self.getItems(input).then(items => {
                        let matchedItems = _self.getMatchedItems(items);
                        if (matchedItems.length > 0) {
                            let finalizeData = [];
                            _self.fetchPreviousItems(matchedItems, input.model, finalizeData).then(success => {
                                if (finalizeData.length > 0) {
                                    _self.insertMany(finalizeData, {}).then(success => {
                                        resolve(success);
                                    }).catch(error => {
                                        reject(error);
                                    });
                                } else {
                                    reject(new CLASSES.NodicsError('ERR_MDL_00000', 'None items found to be updated'));
                                }
                            }).catch(error => {
                                reject(error);
                            });
                        } else {
                            reject(new CLASSES.NodicsError('ERR_MDL_00000', 'None items found to be updated'));
                        }
                    }).catch(error => {
                        reject(error);
                    });
                } catch (error) {
                    reject(error);
                }
            });
        }
    }
};
