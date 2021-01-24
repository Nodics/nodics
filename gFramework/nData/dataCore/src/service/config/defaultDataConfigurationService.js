/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

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

    setImportInterceptors: function (interceptors) {
        this.importInterceptors = interceptors;
    },

    getImportInterceptors: function (entityName) {
        if (!this.importInterceptors[entityName]) {
            this.importInterceptors[entityName] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(entityName, ENUMS.InterceptorType.import.key);
        }
        return this.importInterceptors[entityName];
    },

    setExportInterceptors: function (interceptors) {
        this.exportInterceptors = interceptors;

    },

    getExportInterceptors: function (entityName) {
        if (!this.exportInterceptors[entityName]) {
            this.exportInterceptors[entityName] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(entityName, ENUMS.InterceptorType.export.key);
        }
        return this.exportInterceptors[entityName];
    },

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

    handleImportInterceptorUpdated: function (request, callback) {
        try {
            this.refreshImportInterceptors(request.event.data);
            callback(null, { code: 'SUC_EVNT_00000' });
        } catch (error) {
            callback(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
        }
    },

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

    handleExportInterceptorUpdated: function (request, callback) {
        try {
            this.refreshExportInterceptors(request.event.data);
            callback(null, { code: 'SUC_EVNT_00000' });
        } catch (error) {
            callback(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
        }
    },


    setImportValidators: function (validators) {
        this.importValidators = validators;
    },

    getImportValidators: function (tenant, entityName) {
        if (!this.importValidators[tenant] || !this.importValidators[tenant][entityName]) {
            if (!this.importValidators[tenant]) this.importValidators[tenant] = {};
            this.importValidators[tenant][entityName] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, entityName, ENUMS.InterceptorType.import.key);
        }
        return this.importValidators[tenant][entityName];
    },

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

    handleImportValidatorUpdated: function (request, callback) {
        try {
            this.refreshImportValidators(request.tenant, request.event.data);
            callback(null, { code: 'SUC_EVNT_00000' });
        } catch (error) {
            callback(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
        }
    },

    setExportValidators: function (validators) {
        this.exportValidators = validators;
    },

    getExportValidators: function (tenant, entityName) {
        if (!this.exportValidators[tenant] || !this.exportValidators[tenant][entityName]) {
            if (!this.exportValidators[tenant]) this.exportValidators[tenant] = {};
            this.exportValidators[tenant][entityName] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, entityName, ENUMS.InterceptorType.export.key);
        }
        return this.exportValidators[tenant][entityName];
    },

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

    handleExportValidatorUpdated: function (request, callback) {
        try {
            this.refreshExportValidators(request.tenant, request.event.data);
            callback(null, { code: 'SUC_EVNT_00000' });
        } catch (error) {
            callback(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
        }
    }
};