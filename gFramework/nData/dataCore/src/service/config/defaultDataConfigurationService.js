/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module gFramework/nData/dataCore/src/service/config/defaultDataConfigurationService
 * @description Implements nData default data configuration service business behavior and extension logic.
 * @layer service
 * @owner nData
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    importInterceptors: {},
    exportInterceptors: {},

    importValidators: {},
    exportValidatos: {},

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

    /**

     * Updates import interceptors information.

     *

     * @param {*} interceptors Method input.

     * @returns {*} Method result.

     */

    setImportInterceptors: function (interceptors) {
        this.importInterceptors = interceptors;
    },

    /**

     * Retrieves import interceptors information.

     *

     * @param {*} entityName Method input.

     * @returns {*} Method result.

     */

    getImportInterceptors: function (entityName) {
        if (!this.importInterceptors[entityName]) {
            this.importInterceptors[entityName] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(entityName, ENUMS.InterceptorType.import.key);
        }
        return this.importInterceptors[entityName];
    },

    /**

     * Updates export interceptors information.

     *

     * @param {*} interceptors Method input.

     * @returns {*} Method result.

     */

    setExportInterceptors: function (interceptors) {
        this.exportInterceptors = interceptors;

    },

    /**

     * Retrieves export interceptors information.

     *

     * @param {*} entityName Method input.

     * @returns {*} Method result.

     */

    getExportInterceptors: function (entityName) {
        if (!this.exportInterceptors[entityName]) {
            this.exportInterceptors[entityName] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(entityName, ENUMS.InterceptorType.export.key);
        }
        return this.exportInterceptors[entityName];
    },

    /**

     * Executes refresh import interceptors behavior.

     *

     * @param {*} entities Method input.

     * @returns {*} Method result.

     */

    refreshImportInterceptors: function (entities) {
        if (this.importInterceptors && !UTILS.isBlank(this.importInterceptors) && entities && entities.length > 0) {
            entities.forEach(entityName => {
                if (!entityName || entityName === 'default') {
                    let tmpInterceptors = {};
                    Object.keys(this.importInterceptors).forEach(entityName => {
                        tmpInterceptors[schemaName] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(entityName, ENUMS.InterceptorType.import.key);
                    });
                    this.importInterceptors = tmpInterceptors;
                } else if (this.importInterceptors[entityName]) {
                    this.importInterceptors[entityName] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(entityName, ENUMS.InterceptorType.import.key);
                }
            });
        }
    },

    /**

     * Processes import interceptor updated behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    handleImportInterceptorUpdated: function (request, callback) {
        try {
            this.refreshImportInterceptors(request.event.data);
            callback(null, { code: 'SUC_EVNT_00000' });
        } catch (error) {
            callback(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
        }
    },

    /**

     * Executes refresh export interceptors behavior.

     *

     * @param {*} entities Method input.

     * @returns {*} Method result.

     */

    refreshExportInterceptors: function (entities) {
        if (this.exportInterceptors && !UTILS.isBlank(this.exportInterceptors) && entities && entities.length > 0) {
            entities.forEach(entityName => {
                if (!entityName || entityName === 'default') {
                    let tmpInterceptors = {};
                    Object.keys(this.exportInterceptors).forEach(entityName => {
                        tmpInterceptors[schemaName] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(entityName, ENUMS.InterceptorType.export.key);
                    });
                    this.exportInterceptors = tmpInterceptors;
                } else if (this.exportInterceptors[entityName]) {
                    this.exportInterceptors[entityName] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(entityName, ENUMS.InterceptorType.export.key);
                }
            });
        }
    },

    /**

     * Processes export interceptor updated behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    handleExportInterceptorUpdated: function (request, callback) {
        try {
            this.refreshExportInterceptors(request.event.data);
            callback(null, { code: 'SUC_EVNT_00000' });
        } catch (error) {
            callback(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
        }
    },


    /**


     * Updates import validators information.


     *


     * @param {*} validators Method input.


     * @returns {*} Method result.


     */


    setImportValidators: function (validators) {
        this.importValidators = validators;
    },

    /**

     * Retrieves import validators information.

     *

     * @param {*} tenant Method input.

     * @param {*} entityName Method input.

     * @returns {*} Method result.

     */

    getImportValidators: function (tenant, entityName) {
        if (!this.importValidators[tenant] || !this.importValidators[tenant][entityName]) {
            if (!this.importValidators[tenant]) this.importValidators[tenant] = {};
            this.importValidators[tenant][entityName] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, entityName, ENUMS.InterceptorType.import.key);
        }
        return this.importValidators[tenant][entityName];
    },

    /**

     * Executes refresh import validators behavior.

     *

     * @param {*} tenant Method input.

     * @param {*} entities Method input.

     * @returns {*} Method result.

     */

    refreshImportValidators: function (tenant, entities) {
        if (this.importValidators[tenant] && !UTILS.isBlank(this.importValidators[tenant]) && entities && entities.length > 0) {
            entities.forEach(entityName => {
                if (!entityName || entityName === 'default') {
                    let tenantValidators = {};
                    Object.keys(this.importValidators[tenant]).forEach(entityName => {
                        tenantValidators[entityName] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, entityName, ENUMS.InterceptorType.import.key);
                    });
                    this.importValidators[tenant] = tenantValidators;
                } else if (this.importValidators[tenant][entityName]) {
                    this.importValidators[tenant][entityName] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, entityName, ENUMS.InterceptorType.import.key);
                }
            });
        }
    },

    /**

     * Processes import validator updated behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    handleImportValidatorUpdated: function (request, callback) {
        try {
            this.refreshImportValidators(request.tenant, request.event.data);
            callback(null, { code: 'SUC_EVNT_00000' });
        } catch (error) {
            callback(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
        }
    },

    /**

     * Updates export validators information.

     *

     * @param {*} validators Method input.

     * @returns {*} Method result.

     */

    setExportValidators: function (validators) {
        this.exportValidators = validators;
    },

    /**

     * Retrieves export validators information.

     *

     * @param {*} tenant Method input.

     * @param {*} entityName Method input.

     * @returns {*} Method result.

     */

    getExportValidators: function (tenant, entityName) {
        if (!this.exportValidators[tenant] || !this.exportValidators[tenant][entityName]) {
            if (!this.exportValidators[tenant]) this.exportValidators[tenant] = {};
            this.exportValidators[tenant][entityName] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, entityName, ENUMS.InterceptorType.export.key);
        }
        return this.exportValidators[tenant][entityName];
    },

    /**

     * Executes refresh export validators behavior.

     *

     * @param {*} tenant Method input.

     * @param {*} entities Method input.

     * @returns {*} Method result.

     */

    refreshExportValidators: function (tenant, entities) {
        if (this.exportValidators[tenant] && !UTILS.isBlank(this.exportValidators[tenant]) && entities && entities.length > 0) {
            entities.forEach(entityName => {
                if (!entityName || entityName === 'default') {
                    let tenantValidators = {};
                    Object.keys(this.exportValidators[tenant]).forEach(entityName => {
                        tenantValidators[entityName] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, entityName, ENUMS.InterceptorType.export.key);
                    });
                    this.exportValidators[tenant] = tenantValidators;
                } else if (this.exportValidators[tenant][entityName]) {
                    this.exportValidators[tenant][entityName] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, entityName, ENUMS.InterceptorType.export.key);
                }
            });
        }
    },

    /**

     * Processes export validator updated behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    handleExportValidatorUpdated: function (request, callback) {
        try {
            this.refreshExportValidators(request.tenant, request.event.data);
            callback(null, { code: 'SUC_EVNT_00000' });
        } catch (error) {
            callback(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
        }
    }
};