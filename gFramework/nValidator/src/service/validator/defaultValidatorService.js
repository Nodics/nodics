/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

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


    loadTenantValidators: function (tenants, validators = {}) {
        return new Promise((resolve, reject) => {
            try {
                if (tenants && tenants.length > 0) {
                    let tenant = tenants.shift();
                    this.get({
                        tenant: tenant
                    }).then(validatorItems => {
                        validators[tenant] = validatorItems.result || [];
                        this.loadTenantValidators(tenants, validators).then(validators => {
                            resolve(validators);
                        }).catch(error => {
                            reject(error);
                        });
                    });
                } else {
                    resolve(validators);
                }
            } catch (error) {
                reject(error);
            }
        });
    },

    loadValidators: function () {
        return new Promise((resolve, reject) => {
            try {
                this.loadTenantValidators(NODICS.getActiveTenants()).then(validators => {
                    this.loadRawValidators(validators);
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    },

    loadRawValidators: function (validatorItems) {
        let validators = {};
        Object.keys(validatorItems).forEach(tenant => {
            let tenantValidators = validatorItems[tenant];
            if (!validators[tenant]) validators[tenant] = {};
            tenantValidators.forEach(validator => {
                if (!validator.type || !ENUMS.ValidatorType.isDefined(validator.type)) {
                    this.LOG.error('Type within validator definition is invalid for : ' + validator.code);
                    throw new CLASSES.NodicsError('ERR_SYS_00000', 'Type within validator definition is invalid for : ' + validator.code);
                } else if (!validator.trigger) {
                    this.LOG.error('trigger within validator definition can not be null or empty: ' + validator.code);
                    throw new CLASSES.NodicsError('ERR_SYS_00000', 'trigger within validator definition can not be null or empty: ' + validator.code);
                } else {
                    if (!validator.item) {
                        validator.item = 'default';
                    }
                    if (!validators[tenant][validator.type]) {
                        validators[tenant][validator.type] = {};
                    }
                    if (!validators[tenant][validator.type][validator.item]) {
                        validators[tenant][validator.type][validator.item] = {};
                    }
                    if (!validators[tenant][validator.type][validator.item][validator.code]) {
                        validators[tenant][validator.type][validator.item][validator.code] = validator;
                    } else {
                        _.merge(validators[tenant][validator.type][validator.item][validator.code], validator);
                    }
                }
            });
        });
        SERVICE.DefaultValidatorConfigurationService.setRawValidators(_.merge(
            SERVICE.DefaultValidatorConfigurationService.getRawValidators(),
            validators
        ));
    },

    handleValidatorChangeEvent: function (request) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.start('validatorUpdatedPipeline', {
                authData: request.authData,
                tenant: request.tenant,
                moduleName: request.moduleName,
                event: request.event,
                data: request.event.data
            }, {}).then(success => {
                resolve('Validator updated successfully');
            }).catch(error => {
                reject(error);
            });
        });
    },

    executeValidators: function (validatorList, request, response) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (validatorList && validatorList.length > 0) {
                    let validator = validatorList.shift();
                    if (validator.handler) {
                        let serviceName = validator.handler.substring(0, validator.handler.indexOf('.'));
                        let functionName = validator.handler.substring(validator.handler.indexOf('.') + 1, validator.handler.length);
                        SERVICE[serviceName][functionName](request, response).then(success => {
                            _self.executeValidators(validatorList, request, response).then(success => {
                                resolve(success);
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        UTILS.evaluateScript(request, response, validator.script).then(success => {
                            _self.executeValidators(validatorList, request, response).then(success => {
                                resolve(success);
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    }
                } else {
                    resolve(true);
                }
            } catch (error) {
                reject(error);
            }
        });
    },
};