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
        validateModel: function (query, options, model) {
            return new Promise((resolve, reject) => {
                if (!model) {
                    reject('Invalid model value to save');
                } else if (model.versionId === undefined || model.versionId < 0) {
                    reject('Invalid versionId value to save');
                }
                try {
                    let customQuery = _.merge({}, query);
                    let customOptions = _.merge(_.merge({}, options), {
                        limit: 1,
                        sort: {
                            versionId: -1
                        },
                        projection: {
                            _id: 0
                        }
                    });
                    this.getItems({
                        query: customQuery,
                        options: customOptions
                    }).then(success => {
                        if (success && success.length > 0) {
                            let preMoidel = success[0];
                            preMoidel.versionId = preMoidel.versionId || -1;
                            if (model.versionId <= preMoidel.versionId) {
                                reject('Invalid version id: ' + model.versionId + ', it should be: ' + (preMoidel.versionId + 1));
                            } else {
                                model.versionId = preMoidel.versionId + 1;
                                resolve(_.merge(preMoidel, model));
                            }
                        } else {
                            if (model.versionId > 0) {
                                reject('Invalid version id: ' + model.versionId + ', it should be 0');
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

        saveVersionedItems: function (input) {
            let _self = this;
            return new Promise((resolve, reject) => {
                try {
                    _self.validateModel(input.query, input.options, input.model).then(model => {
                        _self.insertOne(model, {}).then(result => {
                            if (result.ops && result.ops.length > 0) {
                                resolve(result.ops[0]);
                            } else {
                                reject('Failed to create doc, , Please check your modelSaveOptions');
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
        }
    }
};