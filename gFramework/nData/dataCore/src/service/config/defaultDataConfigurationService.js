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

    refreshImportInterceptors: function (entityName) {
        if (this.importInterceptors && !UTILS.isBlank(this.importInterceptors)) {
            if (!entityName || entityName === 'default') {
                let tmpInterceptors = {};
                Object.keys(this.importInterceptors).forEach(entityName => {
                    tmpInterceptors[schemaName] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(entityName, ENUMS.InterceptorType.import.key);
                });
                this.importInterceptors = tmpInterceptors;
            } else if (this.importInterceptors[entityName]) {
                this.importInterceptors[entityName] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(entityName, ENUMS.InterceptorType.import.key);
            }
        }
    },

    handleImportInterceptorUpdated: function (event, callback) {
        try {
            let entityName = event.data.item;
            this.refreshImportInterceptors(entityName);
            callback(null, {
                success: true,
                code: 'SUC_EVNT_00000',
                msg: success
            });
        } catch (error) {
            callback({
                success: false,
                code: 'ERR_EVNT_00000',
                msg: error
            });
        }
    },

    refreshExportInterceptors: function (entityName) {
        if (this.exportInterceptors && !UTILS.isBlank(this.exportInterceptors)) {
            if (!entityName || entityName === 'default') {
                let tmpInterceptors = {};
                Object.keys(this.exportInterceptors).forEach(entityName => {
                    tmpInterceptors[schemaName] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(entityName, ENUMS.InterceptorType.export.key);
                });
                this.exportInterceptors = tmpInterceptors;
            } else if (this.exportInterceptors[entityName]) {
                this.exportInterceptors[entityName] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(entityName, ENUMS.InterceptorType.export.key);
            }
        }
    },

    handleExportInterceptorUpdated: function (event, callback) {
        try {
            let entityName = event.data.item;
            this.refreshExportInterceptors(entityName);
            callback(null, {
                success: true,
                code: 'SUC_EVNT_00000',
                msg: success
            });
        } catch (error) {
            callback({
                success: false,
                code: 'ERR_EVNT_00000',
                msg: error
            });
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

    refreshImportValidators: function (tenant, entityName) {
        if (this.importValidators[tenant] && !UTILS.isBlank(this.importValidators[tenant])) {
            if (!entityName || entityName === 'default') {
                let tenantValidators = {};
                Object.keys(this.importValidators[tenant]).forEach(entityName => {
                    tenantValidators[entityName] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, entityName, ENUMS.InterceptorType.import.key);
                });
                this.importValidators[tenant] = tenantValidators;
            } else if (this.importValidators[tenant][entityName]) {
                this.importValidators[tenant][entityName] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, entityName, ENUMS.InterceptorType.import.key);
            }
        }
    },

    handleImportValidatorUpdated: function (event, callback) {
        try {
            this.refreshImportValidators(event.data.tenant, event.data.item);
            callback(null, {
                success: true,
                code: 'SUC_EVNT_00000',
                msg: success
            });
        } catch (error) {
            callback({
                success: false,
                code: 'ERR_EVNT_00000',
                msg: error
            });
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

    refreshExportValidators: function (tenant, entityName) {
        if (this.exportValidators[tenant] && !UTILS.isBlank(this.exportValidators[tenant])) {
            if (!entityName || entityName === 'default') {
                let tenantValidators = {};
                Object.keys(this.exportValidators[tenant]).forEach(entityName => {
                    tenantValidators[entityName] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, entityName, ENUMS.InterceptorType.export.key);
                });
                this.exportValidators[tenant] = tenantValidators;
            } else if (this.exportValidators[tenant][entityName]) {
                this.exportValidators[tenant][entityName] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, entityName, ENUMS.InterceptorType.export.key);
            }
        }
    },

    handleExportValidatorUpdated: function (event, callback) {
        try {
            this.refreshExportValidators(event.data.tenant, event.data.item);
            callback(null, {
                success: true,
                code: 'SUC_EVNT_00000',
                msg: success
            });
        } catch (error) {
            callback({
                success: false,
                code: 'ERR_EVNT_00000',
                msg: error
            });
        }
    }
};