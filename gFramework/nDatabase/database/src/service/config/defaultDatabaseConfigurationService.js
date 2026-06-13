/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const util = require('util');

/**
 * @module database/service/config/DefaultDatabaseConfigurationService
 * @description Runtime registry for Nodics database configuration, tenant database
 * handles, raw schema contracts, schema interceptors, and schema validators.
 * This service is part of the schema-driven persistence layer and must remain
 * compatible with layered module overrides.
 * @layer service
 * @owner nDatabase
 * @override Project modules may override this service to customize database
 * configuration resolution, connection registry behavior, or schema-level
 * interceptor/validator caching while preserving tenant and module isolation.
 *
 * @property {Object} rawSchema Effective merged raw schema registry.
 * @property {Object} dbs Tenant database connection registry grouped by module.
 * @property {Object} interceptors Cached schema interceptor configuration.
 * @property {Object} validators Cached tenant-aware schema validator configuration.
 * @property {Object} CONFIG.database Layered database configuration per tenant.
 * @property {Object} SERVICE.DefaultFilesLoaderService Loads schema model files.
 * @property {Object} SERVICE.DefaultInterceptorConfigurationService Builds schema interceptor chains.
 * @property {Object} SERVICE.DefaultValidatorConfigurationService Builds schema validator chains.
 */
module.exports = {
    rawSchema: {},
    dbs: {},
    interceptors: {},
    validators: {},

    /**
     * Initializes the database configuration registry.
     *
     * @param {Object} options Startup options supplied by the module initializer.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Loads raw model definitions after framework services are available.
     *
     * @param {Object} options Startup options supplied by the module initializer.
     * @returns {Promise<boolean>} Resolves after raw model files are loaded.
     * @sideEffects Updates `NODICS` raw model registry from `/src/schemas/model.js` files.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            this.LOG.debug('Collecting database middlewares');
            NODICS.setRawModels(SERVICE.DefaultFilesLoaderService.loadFiles('/src/schemas/model.js'));
            resolve(true);
        });
    },

    /**
     * Returns the effective raw schema registry.
     *
     * @returns {Object} Raw schema definitions grouped by module and schema code.
     */
    getRawSchema: function () {
        return this.rawSchema;
    },

    /**
     * Replaces the effective raw schema registry.
     *
     * @param {Object} rawSchema Raw schema definitions grouped by module and schema code.
     * @returns {undefined}
     * @sideEffects Mutates the service-level schema registry.
     */
    setRawSchema: function (rawSchema) {
        this.rawSchema = rawSchema;
    },

    /**
     * Finds active modules that have database configuration.
     *
     * @returns {string[]} Active module names with a database configuration block.
     */
    getDatabaseActiveModules: function () {
        let modules = NODICS.getModules();
        let dbModules = [];
        _.each(modules, (value, moduleName) => {
            if (CONFIG.get('database')[moduleName]) {
                dbModules.push(moduleName);
            }
        });
        return dbModules;
    },

    /**
     * Resolves the database connection configuration for a module and tenant.
     *
     * @param {string} moduleName Active module requesting a database connection.
     * @param {string} tenant Active tenant code.
     * @returns {Object} Database-type-specific connection configuration with merged options.
     * @throws {CLASSES.NodicsError} When the module, tenant, or database type configuration is invalid.
     */
    getDatabaseConfiguration: function (moduleName, tenant) {
        if (!moduleName && !NODICS.isModuleActive(moduleName)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Invalid module name: ' + moduleName);
        } else if (!tenant && !NODICS.getActiveTenants().includes(tenant)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Invalid tenant name: ' + tenant);
        } else {
            let defaultConfig = CONFIG.get('database', tenant);
            let dbConfig = _.merge(_.merge({}, defaultConfig.default), defaultConfig[moduleName] || {});
            let connConfig = dbConfig[dbConfig.options.databaseType];
            if (connConfig) {
                connConfig.options = _.merge(_.merge({}, dbConfig.options), connConfig.options);
                return connConfig;
            } else {
                throw new CLASSES.NodicsError('ERR_DBS_00003', 'Configuration is not valid for module: ' + moduleName + ', tenant: ' + tenant);
            }
        }
    },

    /**
     * Registers a tenant database handle for a module.
     *
     * @param {string} moduleName Active module name.
     * @param {string} tenant Active tenant code.
     * @param {Object} database Database handle or connection wrapper.
     * @returns {undefined}
     * @sideEffects Mutates the in-memory `dbs` registry.
     * @throws {CLASSES.NodicsError} When module or tenant input is invalid.
     */
    addTenantDatabase: function (moduleName, tenant, database) {
        if (!moduleName && !NODICS.isModuleActive(moduleName)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Invalid module name: ' + moduleName);
        } else if (!tenant && !NODICS.getActiveTenants().includes(tenant)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Invalid tenant name: ' + tenant);
        } else {
            if (!this.dbs[moduleName]) {
                this.dbs[moduleName] = {};
            }
            this.dbs[moduleName][tenant] = database;
        }
    },

    /**
     * Reads a tenant database handle from the module registry.
     *
     * @param {string} moduleName Active module name. Falls back to `default` registry when unavailable.
     * @param {string} tenant Active tenant code.
     * @returns {Object|undefined} Database handle for the tenant.
     * @throws {CLASSES.NodicsError} When module or tenant input is invalid.
     */
    getTenantDatabase: function (moduleName, tenant) {
        if (!moduleName && !NODICS.isModuleActive(moduleName)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Invalid module name: ' + moduleName);
        } else if (!tenant && !NODICS.getActiveTenants().includes(tenant)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Invalid tenant name: ' + tenant);
        } else {
            let database = {};
            if (moduleName && this.dbs[moduleName]) {
                database = this.dbs[moduleName];
            } else {
                database = this.dbs.default;
            }
            return database[tenant];
        }
    },

    /**
     * Removes a tenant database handle from the module registry.
     *
     * @param {string} moduleName Active module name.
     * @param {string} tenant Active tenant code.
     * @returns {boolean} Always returns true after attempting removal.
     * @sideEffects Deletes an in-memory database handle.
     * @throws {CLASSES.NodicsError} When module or tenant input is invalid.
     */
    removeTenantDatabase: function (moduleName, tenant) {
        if (!moduleName && !NODICS.isModuleActive(moduleName)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Invalid module name: ' + moduleName);
        } else if (!tenant && !NODICS.getActiveTenants().includes(tenant)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Invalid tenant name: ' + tenant);
        } else if (this.dbs[moduleName] && this.dbs[moduleName][tenant]) {
            delete this.dbs[moduleName][tenant];
        }
        return true;
    },

    /**
     * Converts a value into the configured database object id type when required.
     *
     * @param {Object} schemaModel Schema model containing database options.
     * @param {*} value Raw identifier or already converted object id.
     * @returns {*} Converted object id when the model handler supports conversion.
     */
    toObjectId: function (schemaModel, value) {
        let modelHandlerName = schemaModel.dataBase.getOptions().modelHandler;
        if (UTILS.isObject(value)) {
            return value;
        } else if (!UTILS.isObjectId(value) && SERVICE[modelHandlerName] && SERVICE[modelHandlerName].toObjectId) {
            return SERVICE[modelHandlerName].toObjectId(value);
        } else {
            return value;
        }
    },

    /**
     * Replaces the cached schema interceptor registry.
     *
     * @param {Object} interceptors Interceptor registry keyed by schema name.
     * @returns {undefined}
     */
    setSchemaInterceptors: function (interceptors) {
        this.interceptors = interceptors;
    },

    /**
     * Returns schema interceptors, building the cache on first access.
     *
     * @param {string} schemaName Schema code.
     * @returns {Object} Prepared schema interceptor configuration.
     */
    getSchemaInterceptors: function (schemaName) {
        if (!this.interceptors[schemaName]) {
            this.interceptors[schemaName] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(schemaName, ENUMS.InterceptorType.schema.key);
        }
        return this.interceptors[schemaName];
    },

    /**
     * Refreshes cached schema interceptor definitions.
     *
     * @param {string[]} schemaNames Schema names to refresh, or `default` to refresh all cached schemas.
     * @returns {undefined}
     * @sideEffects Rebuilds entries in the interceptor cache.
     */
    refreshSchemaInterceptors: function (schemaNames) {
        if (this.interceptors && !UTILS.isBlank(this.interceptors) && schemaNames && schemaNames.length > 0) {
            schemaNames.forEach(schemaName => {
                if (!schemaName || schemaName === 'default') {
                    let tmpInterceptors = {};
                    Object.keys(this.interceptors).forEach(schemaName => {
                        tmpInterceptors[schemaName] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(schemaName, ENUMS.InterceptorType.schema.key);
                    });
                    this.interceptors = tmpInterceptors;
                } else if (this.interceptors[schemaName]) {
                    this.interceptors[schemaName] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(schemaName, ENUMS.InterceptorType.schema.key);
                }
            });
        }
    },

    /**
     * Handles schema interceptor update events.
     *
     * @param {Object} request Nodics event request.
     * @param {Object} request.event Event payload.
     * @param {string[]} request.event.data Schema names affected by the update.
     * @param {Function} callback Node-style callback.
     * @returns {undefined}
     */
    handleSchemaInterceptorUpdated: function (request, callback) {
        try {
            this.refreshSchemaInterceptors(request.event.data);
            callback(null, { code: 'SUC_EVNT_00000' });
        } catch (error) {
            callback(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
        }
    },

    /**
     * Replaces the cached schema validator registry.
     *
     * @param {Object} validators Validator registry keyed by tenant and schema name.
     * @returns {undefined}
     */
    setSchemaValidators: function (validators) {
        this.validators = validators;
    },

    /**
     * Returns schema validators for a tenant and schema, building the cache on first access.
     *
     * @param {string} tenant Active tenant code.
     * @param {string} schemaName Schema code.
     * @returns {Object} Prepared validator configuration.
     */
    getSchemaValidators: function (tenant, schemaName) {
        if (!this.validators[tenant] || !this.validators[tenant][schemaName]) {
            if (!this.validators[tenant]) this.validators[tenant] = {};
            this.validators[tenant][schemaName] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, schemaName, ENUMS.InterceptorType.schema.key);
        }
        return this.validators[tenant][schemaName];
    },

    /**
     * Refreshes cached schema validator definitions for a tenant.
     *
     * @param {string} tenant Active tenant code.
     * @param {string[]} schemaNames Schema names to refresh, or `default` to refresh all cached schemas.
     * @returns {undefined}
     * @sideEffects Rebuilds entries in the tenant validator cache.
     */
    refreshSchemaValidators: function (tenant, schemaNames) {
        if (this.validators[tenant] && !UTILS.isBlank(this.validators[tenant]) && schemaNames && schemaNames.length > 0) {
            schemaNames.forEach(schemaName => {
                if (!schemaName || schemaName === 'default') {
                    let tenantValidators = {};
                    Object.keys(this.validators[tenant]).forEach(schemaName => {
                        tenantValidators[schemaName] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, schemaName, ENUMS.InterceptorType.schema.key);
                    });
                    this.validators[tenant] = tenantValidators;
                } else if (this.validators[tenant][schemaName]) {
                    this.validators[tenant][schemaName] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, schemaName, ENUMS.InterceptorType.schema.key);
                }
            });
        }
    },

    /**
     * Handles schema validator update events.
     *
     * @param {Object} request Nodics event request.
     * @param {string} request.tenant Active tenant code.
     * @param {Object} request.event Event payload.
     * @param {string[]} request.event.data Schema names affected by the update.
     * @param {Function} callback Node-style callback.
     * @returns {undefined}
     */
    handleSchemaValidatorUpdated: function (request, callback) {
        try {
            this.refreshSchemaValidators(request.tenant, request.event.data);
            callback(null, { code: 'SUC_EVNT_00000' });
        } catch (error) {
            callback(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
        }
    },
};
