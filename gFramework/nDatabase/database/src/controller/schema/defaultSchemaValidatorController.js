/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    updateSchemaValidator: function (request, callback) {
        let moduleName = request.moduleName;
        if (request.httpRequest.params.schema) {
            if (callback) {
                FACADE.DefaultSchemaValidatorFacade.updateSchemaValidator(moduleName, request.httpRequest.schema).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                return FACADE.DefaultSchemaValidatorFacade.updateSchemaValidator(moduleName, request.httpRequest.schema);
            }
        } else {
            if (callback) {
                FACADE.DefaultSchemaValidatorFacade.updateModuleSchemaValidators(moduleName).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                return FACADE.DefaultSchemaValidatorFacade.updateModuleSchemaValidators(moduleName);
            }
        }
    },

    updateModulesSchemaValidators: function (request, callback) {
        if (callback) {
            FACADE.DefaultSchemaValidatorFacade.updateModulesSchemaValidators().then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultSchemaValidatorFacade.updateModulesSchemaValidators();
        }
    },
};