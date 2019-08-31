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
        saveItems: function (input) {
            return new Promise((resolve, reject) => {
                if (!input.model) {
                    reject('Invalid model value to save');
                }
                try {
                    let query = _.merge({}, input.query);
                    let options = _.merge(_.merge({}, input.options), {
                        limit: 1,
                        sort: {
                            versionId: -1
                        },
                        projection: {
                            _id: 0
                        }
                    });
                    this.getItems({
                        query: query,
                        options: options
                    }).then(success => {
                        if (success && success.length > 0) {
                            let currentVersionId = success[0].versionId || -1;
                            input.model = _.merge(success[0], input.model);
                            input.model.versionId = currentVersionId + 1;
                        } else {
                            input.model.versionId = 0;
                        }
                        this.insertOne(input.model, {}).then(result => {
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
        },
    }
};