/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    updateSchemaIndexes: function (request, callback) {
        let moduleName = request.moduleName || request.local.moduleName;
        if (request.params.schema) {
            if (callback) {
                FACADE.DefaultSchemaIndexFacade.updateSchemaIndexes(moduleName, request.params.schema).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                return FACADE.DefaultSchemaIndexFacade.updateSchemaIndexes(moduleName, request.params.schema);
            }
        } else {
            if (callback) {
                FACADE.DefaultSchemaIndexFacade.updateModuleIndexes(moduleName).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                return FACADE.DefaultSchemaIndexFacade.updateSchemaIndexes(moduleName);
            }
        }
    },

    updateModulesIndexes: function (request, callback) {
        if (callback) {
            return FACADE.DefaultSchemaIndexFacade.updateModulesIndexes().then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultSchemaIndexFacade.updateModulesIndexes();
        }
    }
};