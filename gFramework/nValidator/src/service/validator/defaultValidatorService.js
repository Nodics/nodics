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
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    prepareValidators: function () {
        return new Promise((resolve, reject) => {
            // let validatorItems = {
            //     defaultImportValidatorDataProcessor: {
            //         type: 'import',
            //         item: 'enterprise',
            //         trigger: 'import',
            //         active: 'true',
            //         index: 0,
            //         handler: 'DefaultSampleImportInterceptorService1.handleEnterpriseImportProcessor'
            //     },
            //     defaultImportValidatorDataProcessor2: {
            //         type: 'import',
            //         item: 'enterprise',
            //         trigger: 'import',
            //         active: 'true',
            //         index: 0,
            //         handler: 'DefaultSampleImportInterceptorService2.handleEnterpriseImportProcessor'
            //     }
            // };
            this.get({
                tenant: 'default'
            }).then(validatorItems => {
                console.log('-------------- ', validatorItems);
                if (validatorItems && validatorItems.success && validatorItems.result.length > 0) {
                    this.buildValidators(validatorItems.result).then(rawValidators => {
                        console.log(util.inspect(rawValidators, false, 6));
                        console.log('------------------------------------------------');
                        let validatorList = this.applyDefaultValidators(rawValidators);
                        console.log(util.inspect(validatorList, false, 6));
                        console.log('------------------------------------------------');
                        let finalValidators = this.arrangeByTigger(validatorList);
                        console.log(util.inspect(finalValidators, false, 6));
                        console.log('------------------------------------------------');
                        SERVICE.DefaultValidatorConfigurationService.setRawValidators(_.merge({}, finalValidators));
                        let indexedValidators = this.sortValidators(finalValidators);
                        console.log(util.inspect(indexedValidators, false, 6));
                        SERVICE.DefaultValidatorConfigurationService.setValidators(indexedValidators);
                        process.exit(1);
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                } else if (validatorItems && validatorItems.success && validatorItems.result.length <= 0) {
                    SERVICE.DefaultValidatorConfigurationService.setRawValidators({});
                    SERVICE.DefaultValidatorConfigurationService.setValidators({});
                    resolve(true);
                } else if (validatorItems && !validatorItems.success) {
                    reject(validatorItems.msg);
                } else {
                    SERVICE.DefaultValidatorConfigurationService.setRawValidators({});
                    SERVICE.DefaultValidatorConfigurationService.setValidators({});
                    resolve(true);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    buildValidators: function (rawValidators) {
        let validators = {};
        return new Promise((resolve, reject) => {
            try {
                rawValidators.forEach(validator => {
                    if (!validator.type || !ENUMS.ValidatorType.isDefined(validator.type)) {
                        this.LOG.error('Type within validator definition is invalid for : ' + validator.code);
                        process.exit(1);
                    } else if (!validator.trigger) {
                        this.LOG.error('trigger within validator definition can not be null or empty: ' + validator.code);
                        process.exit(1);
                    } else {
                        if (!validator.item) {
                            validator.item = 'default';
                        }
                        if (!validators[validator.type]) {
                            validators[validator.type] = {};
                        }
                        if (!validators[validator.type][validator.item]) {
                            validators[validator.type][validator.item] = {};
                        }
                        if (!validators[validator.type][validator.item][validator.code]) {
                            validators[validator.type][validator.item][validator.code] = validator;
                        } else {
                            _.merge(validators[validator.type][validator.item][validator.code], validator);
                        }
                    }
                });
                resolve(validators);
            } catch (error) {
                reject(error);
            }
        });
    },

    applyDefaultValidators: function (validators) {
        let validatorList = {};
        if (validators && !UTILS.isBlank(validators)) {
            _.each(validators, (typeValidators, typeName) => {
                if (!validatorList[typeName]) validatorList[typeName] = {};
                _.each(typeValidators, (itemValidators, itemName) => {
                    if (itemName !== 'default') {
                        validatorList[typeName][itemName] = _.merge(_.merge({}, typeValidators.default || {}), itemValidators);
                    }

                });
            });
        }
        return validatorList;
    },

    arrangeByTigger: function (validators) {
        let validatorList = {};
        if (validators && !UTILS.isBlank(validators)) {
            _.each(validators, (typeValidators, typeName) => {
                if (!validatorList[typeName]) validatorList[typeName] = {};
                _.each(typeValidators, (itemValidators, itemName) => {
                    if (!validatorList[typeName][itemName]) validatorList[typeName][itemName] = {};
                    _.each(itemValidators, (validator, intName) => {
                        validator.name = intName;
                        if (!validatorList[typeName][itemName][validator.trigger]) validatorList[typeName][itemName][validator.trigger] = [];
                        validatorList[typeName][itemName][validator.trigger].push(validator);
                    });
                });
            });
        }
        return validatorList;
    },

    sortValidators: function (validators) {
        let validatorList = {};
        if (validators && !UTILS.isBlank(validators)) {
            _.each(validators, (typeValidators, typeName) => {
                if (!validatorList[typeName]) validatorList[typeName] = {};
                _.each(typeValidators, (itemValidators, itemName) => {
                    if (!validatorList[typeName][itemName]) validatorList[typeName][itemName] = {};
                    _.each(itemValidators, (triggers, triggerName) => {
                        let indexedValidators = UTILS.sortObject(triggers, 'index');
                        let sortedValidators = [];
                        Object.keys(indexedValidators).forEach(key => {
                            if (indexedValidators[key] && indexedValidators[key].length > 0) {
                                sortedValidators = sortedValidators.concat(indexedValidators[key]);
                            }
                        });
                        validatorList[typeName][itemName][triggerName] = sortedValidators;
                    });
                });
            });
        }
        return validatorList;
    },


    executeValidators: function (validatorList, request, responce) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (validatorList && validatorList.length > 0) {
                    let validator = validatorList.shift();
                    let serviceName = validator.handler.substring(0, validator.handler.indexOf('.'));
                    let functionName = validator.handler.substring(validator.handler.indexOf('.') + 1, validator.handler.length);
                    SERVICE[serviceName][functionName](request, responce).then(success => {
                        _self.executeValidators(validatorList, request, responce).then(success => {
                            resolve(success);
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
    }
};