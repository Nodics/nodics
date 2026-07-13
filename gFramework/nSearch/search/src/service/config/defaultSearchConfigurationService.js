/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module gFramework/nSearch/search/src/service/config/defaultSearchConfigurationService
 * @description Implements nSearch default search configuration service business behavior and extension logic.
 * @layer service
 * @owner nSearch
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    searchEngines: {},
    searchSchema: {},
    rawSearchModel: {},
    interceptors: {},
    validators: {},

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

     * Retrieves search active modules information.

     *

     * @returns {*} Method result.

     */

    getSearchActiveModules: function () {
        let modules = NODICS.getModules();
        let dbModules = [];
        _.each(modules, (value, moduleName) => {
            if (CONFIG.get('search')[moduleName]) {
                dbModules.push(moduleName);
            }
        });
        return dbModules;
    },

    /**

     * Retrieves raw search model definition information.

     *

     * @param {*} engine Method input.

     * @returns {*} Method result.

     */

    getRawSearchModelDefinition: function (engine) {
        return this.rawSearchModel[engine];
    },

    /**

     * Updates raw search model definition information.

     *

     * @param {*} engine Method input.

     * @param {*} definition Method input.

     * @returns {*} Method result.

     */

    addRawSearchModelDefinition: function (engine, definition) {
        this.rawSearchModel[engine] = definition;
    },

    /**
     * This function is used to get module specific search configuration, if not enabled, it will return undefined
     * @param {*} moduleName 
     * @param {*} tntCode 
     */
    getSearchConfiguration: function (moduleName, tenant) {
        if (!moduleName && !NODICS.isModuleActive(moduleName)) {
            throw new CLASSES.SearchError('ERR_SRCH_00003', 'Invalid module name: ' + moduleName);
        } else if (!tenant && !NODICS.getActiveTenants().includes(tenant)) {
            throw new CLASSES.SearchError('ERR_SRCH_00003', 'Invalid tenant name: ' + tenant);
        } else {
            let defaultSearchConfig = CONFIG.get('search', tenant);
            let searchConfig = _.merge(_.merge({}, defaultSearchConfig.default), defaultSearchConfig[moduleName] || {});
            let connConfig = searchConfig[searchConfig.options.engine];
            if (connConfig) {
                connConfig.options = _.merge(_.merge({}, searchConfig.options), connConfig.options);
                return connConfig;
            } else {
                throw new CLASSES.SearchError('Configuration is not valid for module: ' + moduleName + ', tenant: ' + tntCode);
            }
        }
    },

    /**

     * Retrieves search engines information.

     *

     * @returns {*} Method result.

     */

    getSearchEngines: function () {
        return this.searchEngines;
    },

    /**

     * Updates tenant search engine information.

     *

     * @param {*} moduleName Method input.

     * @param {*} tenant Method input.

     * @param {*} searchEngine Method input.

     * @returns {*} Method result.

     */

    addTenantSearchEngine: function (moduleName, tenant, searchEngine) {
        if (!moduleName && !NODICS.isModuleActive(moduleName)) {
            throw new Error('Invalid module name: ' + moduleName);
        } else if (!tenant && !NODICS.getActiveTenants().includes(tenant)) {
            throw new Error('Invalid tenant name: ' + tenant);
        } else if (!this.searchEngines[moduleName]) {
            this.searchEngines[moduleName] = {};
        }
        this.searchEngines[moduleName][tenant] = searchEngine;
    },

    /**

     * Removes or clears tenant search engine information.

     *

     * @param {*} moduleName Method input.

     * @param {*} tenant Method input.

     * @returns {*} Method result.

     */

    removeTenantSearchEngine: function (moduleName, tenant) {
        if (this.searchEngines[moduleName] && this.searchEngines[moduleName][tenant]) {
            delete this.searchEngines[moduleName][tenant];
        }
        return true;
    },

    /**

     * Retrieves tenant search engine information.

     *

     * @param {*} moduleName Method input.

     * @param {*} tenant Method input.

     * @returns {*} Method result.

     */

    getTenantSearchEngine: function (moduleName, tenant) {
        if (!moduleName && !NODICS.isModuleActive(moduleName)) {
            throw new CLASSES.SearchError('ERR_SRCH_00003', 'Invalid module name: ' + moduleName);
        } else if (!tenant && !NODICS.getActiveTenants().includes(tenant)) {
            throw new CLASSES.SearchError('ERR_SRCH_00003', 'Invalid tenant name: ' + tenant);
        } else {
            let searchEngine = this.searchEngines[moduleName] || this.searchEngines.default;
            return searchEngine ? searchEngine[tenant] : null;
        }
    },

    /**

     * Updates tenant raw search schema information.

     *

     * @param {*} moduleName Method input.

     * @param {*} tenant Method input.

     * @param {*} definition Method input.

     * @returns {*} Method result.

     */

    addTenantRawSearchSchema: function (moduleName, tenant, definition) {
        if (!moduleName && !NODICS.isModuleActive(moduleName)) {
            throw new CLASSES.SearchError('ERR_SRCH_00003', 'Invalid module name: ' + moduleName);
        } else if (!tenant && !NODICS.getActiveTenants().includes(tenant)) {
            throw new CLASSES.SearchError('ERR_SRCH_00003', 'Invalid tenant name: ' + tenant);
        } else {
            if (!this.searchSchema[moduleName]) {
                this.searchSchema[moduleName] = {};
            }
            if (!this.searchSchema[moduleName][tenant]) {
                this.searchSchema[moduleName][tenant] = {};
            }
            this.searchSchema[moduleName][tenant][definition.typeName] = definition;
        }
    },

    /**

     * Retrieves all raw search schema information.

     *

     * @param {*} moduleName Method input.

     * @param {*} tenant Method input.

     * @returns {*} Method result.

     */

    getAllRawSearchSchema: function (moduleName, tenant) {
        return this.searchSchema;
    },

    /**

     * Retrieves raw search schema information.

     *

     * @param {*} moduleName Method input.

     * @param {*} tenant Method input.

     * @returns {*} Method result.

     */

    getRawSearchSchema: function (moduleName, tenant) {
        if (!moduleName && !NODICS.isModuleActive(moduleName)) {
            throw new CLASSES.SearchError('ERR_SRCH_00003', 'Invalid module name: ' + moduleName);
        } else if (!tenant && !NODICS.getActiveTenants().includes(tenant)) {
            throw new CLASSES.SearchError('ERR_SRCH_00003', 'Invalid tenant name: ' + tenant);
        } else if (this.searchSchema[moduleName] && this.searchSchema[moduleName][tenant]) {
            return this.searchSchema[moduleName][tenant];
        } else {
            return {};
        }
    },

    /**

     * Retrieves tenant raw search schema information.

     *

     * @param {*} moduleName Method input.

     * @param {*} tenant Method input.

     * @param {*} typeName Method input.

     * @returns {*} Method result.

     */

    getTenantRawSearchSchema: function (moduleName, tenant, typeName) {
        if (!moduleName && !NODICS.isModuleActive(moduleName)) {
            throw new CLASSES.SearchError('ERR_SRCH_00003', 'Invalid module name: ' + moduleName);
        } else if (!tenant && !NODICS.getActiveTenants().includes(tenant)) {
            throw new CLASSES.SearchError('ERR_SRCH_00003', 'Invalid tenant name: ' + tenant);
        } else if (this.searchSchema[moduleName] && this.searchSchema[moduleName][tenant]) {
            return this.searchSchema[moduleName][tenant][typeName];
        } else {
            return null;
        }
    },

    /**

     * Removes or clears tenant raw search schema information.

     *

     * @param {*} moduleName Method input.

     * @param {*} tenant Method input.

     * @returns {*} Method result.

     */

    removeTenantRawSearchSchema: function (moduleName, tenant) {
        if (this.searchSchema[moduleName] && this.searchSchema[moduleName][tenant]) {
            delete this.searchSchema[moduleName][tenant];
        }
        return true;
    },

    /**

     * Updates search interceptors information.

     *

     * @param {*} interceptors Method input.

     * @returns {*} Method result.

     */

    setSearchInterceptors: function (interceptors) {
        this.interceptors = interceptors;
    },

    /**

     * Retrieves search interceptors information.

     *

     * @param {*} indexName Method input.

     * @returns {*} Method result.

     */

    getSearchInterceptors: function (indexName) {
        if (!this.interceptors[indexName]) {
            this.interceptors[indexName] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(indexName, ENUMS.InterceptorType.search.key);
        }
        return this.interceptors[indexName];
    },

    /**

     * Executes refresh search interceptors behavior.

     *

     * @param {*} indexes Method input.

     * @returns {*} Method result.

     */

    refreshSearchInterceptors: function (indexes) {
        if (this.validators[tenant] && !UTILS.isBlank(this.validators[tenant]) && indexes && indexes.length > 0) {
            indexes.forEach(indexName => {
                if (!indexName || indexName === 'default') {
                    let tmpInterceptors = {};
                    Object.keys(this.interceptors).forEach(indexName => {
                        tmpInterceptors[indexName] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(indexName, ENUMS.InterceptorType.search.key);
                    });
                    this.interceptors = tmpInterceptors;
                } else if (this.interceptors[indexName]) {
                    this.interceptors[indexName] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(indexName, ENUMS.InterceptorType.search.key);
                }
            });
        }
    },

    /**

     * Processes search interceptor updated behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    handleSearchInterceptorUpdated: function (request, callback) {
        try {
            this.refreshSearchInterceptors(request.event.data);
            callback(null, { code: 'SUC_EVNT_00000' });
        } catch (error) {
            callback(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
        }
    },

    /**

     * Updates search validators information.

     *

     * @param {*} validators Method input.

     * @returns {*} Method result.

     */

    setSearchValidators: function (validators) {
        this.validators = validators;
    },

    /**

     * Retrieves search validators information.

     *

     * @param {*} tenant Method input.

     * @param {*} indexName Method input.

     * @returns {*} Method result.

     */

    getSearchValidators: function (tenant, indexName) {
        if (!this.validators[tenant] || !this.validators[tenant][indexName]) {
            if (!this.validators[tenant]) this.validators[tenant] = {};
            this.validators[tenant][indexName] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, indexName, ENUMS.InterceptorType.search.key);
        }
        return this.validators[tenant][indexName];
    },

    /**

     * Executes refresh search validators behavior.

     *

     * @param {*} tenant Method input.

     * @param {*} indexes Method input.

     * @returns {*} Method result.

     */

    refreshSearchValidators: function (tenant, indexes) {
        if (this.validators[tenant] && !UTILS.isBlank(this.validators[tenant]) && indexes && indexes.length > 0) {
            indexes.forEach(indexName => {
                if (!indexName || indexName === 'default') {
                    let tenantValidators = {};
                    Object.keys(this.validators[tenant]).forEach(indexName => {
                        tenantValidators[indexName] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, indexName, ENUMS.InterceptorType.search.key);
                    });
                    this.validators[tenant] = tenantValidators;
                } else if (this.validators[tenant][indexName]) {
                    this.validators[tenant][indexName] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, indexName, ENUMS.InterceptorType.search.key);
                }
            });
        }
    },

    /**

     * Processes search validator updated behavior.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    handleSearchValidatorUpdated: function (request, callback) {
        try {
            this.refreshSearchValidators(request.tenant, request.event.data);
            callback(null, { code: 'SUC_EVNT_00000' });
        } catch (error) {
            callback(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
        }
    },
};