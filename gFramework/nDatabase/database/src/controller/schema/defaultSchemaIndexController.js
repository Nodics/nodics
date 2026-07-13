/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module database/controller/schema/DefaultSchemaIndexController
 * @description Controller for secured schema index maintenance routes. It
 * delegates module-wide and schema-specific index refresh requests to the schema
 * index facade.
 * @layer controller
 * @owner nDatabase
 * @override Project modules may override this controller to customize admin
 * authorization, request shape, or response handling while preserving facade
 * delegation contracts.
 *
 * @property {Object} request.httpRequest.params Route parameters supplied by router pipeline.
 * @property {string} request.moduleName Module owning the schema indexes.
 */
module.exports = {

    /**
     * Updates indexes for one schema when `:schema` is present, otherwise for the request module.
     *
     * @param {Object} request Nodics controller request.
     * @param {Function} [callback] Optional Node-style callback.
     * @returns {Promise|undefined} Promise when no callback is supplied.
     */
    updateSchemaIndexes: function (request, callback) {
        let moduleName = request.moduleName;
        if (request.httpRequest.params.schema) {
            if (callback) {
                FACADE.DefaultSchemaIndexFacade.updateSchemaIndexes(moduleName, request.httpRequest.params.schema).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                return FACADE.DefaultSchemaIndexFacade.updateSchemaIndexes(moduleName, request.httpRequest.params.schema);
            }
        } else {
            if (callback) {
                FACADE.DefaultSchemaIndexFacade.updateModuleIndexes(moduleName).then(success => {
                    callback(null, success);
                }).catch(error => {
                    callback(error);
                });
            } else {
                return FACADE.DefaultSchemaIndexFacade.updateModuleIndexes(moduleName);
            }
        }
    },

    /**
     * Updates indexes for all active modules.
     *
     * @param {Object} request Nodics controller request.
     * @param {Function} [callback] Optional Node-style callback.
     * @returns {Promise|undefined} Promise when no callback is supplied.
     */
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
