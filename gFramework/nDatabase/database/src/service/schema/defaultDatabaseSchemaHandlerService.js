/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module database/service/schema/DefaultDatabaseSchemaHandlerService
 * @description Builds effective Nodics database schemas from layered schema
 * definitions. It merges default schema contracts, resolves `super` inheritance,
 * and supports runtime schema additions without breaking module ownership.
 * @layer service
 * @owner nDatabase
 * @override Project modules may override this service to customize schema
 * inheritance and runtime merge rules, but must preserve module-scoped final
 * schema output for generated models, APIs, and validators.
 *
 * @property {Object} NODICS.modules Active module registry whose module objects receive `rawSchema`.
 * @property {Object} SERVICE.DefaultDatabaseConfigurationService Stores runtime raw schema registry.
 */
module.exports = {
    /**
     * Initializes the database schema handler.
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
     * Finalizes the database schema handler.
     *
     * @param {Object} options Startup options supplied by the module initializer.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Builds effective module schemas from the merged schema registry.
     *
     * @param {Object} mergedSchema Merged schema map grouped by module name.
     * @returns {Promise<boolean>} Resolves after each owning module receives its final `rawSchema`.
     * @sideEffects Mutates active module objects by assigning `moduleObject.rawSchema`.
     * @throws {CLASSES.NodicsError} When schema inheritance resolution fails.
     */
    buildDatabaseSchema: function (mergedSchema) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                _self.LOG.debug('Starting schemas loading process');
                let defaultSchema = mergedSchema.default || {};
                let modules = NODICS.getModules();
                Object.keys(mergedSchema).forEach(function (key) {
                    if (key !== 'default') {
                        let moduleObject = modules[key];
                        if (!moduleObject) {
                            _self.LOG.error('Module name : ' + key + ' is not valid. Please define a valide module name in schema');
                            _self.LOG.error('Please package.json file in module: ' + key + ', may be value is name property not valid');
                            process.exit(CONFIG.get('errorExitCode'));
                        }
                        moduleObject.rawSchema = _self.resolveModuleSchemaDependancy({
                            moduleName: key,
                            rawSchema: _.merge(_.merge({}, defaultSchema), mergedSchema[key])
                        });
                    }
                });
                resolve(true);
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_DBS_00000'));
            }

        });
    },

    /**
     * Adds or updates a schema definition at runtime.
     *
     * @param {Object} runtimeSchema Runtime schema definition.
     * @param {string} runtimeSchema.moduleName Owning module name or `default`.
     * @param {string} runtimeSchema.code Schema code.
     * @param {string} [runtimeSchema.super] Optional schema inherited within the owning module.
     * @returns {Promise<boolean>} Resolves after the runtime schema is merged.
     * @sideEffects Updates raw schema registry and the owning module raw schema.
     * @throws {CLASSES.NodicsError} When `super` points to an unknown schema.
     */
    buildRuntimeSchema: function (runtimeSchema) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let schema = {};
                schema[runtimeSchema.moduleName] = {};
                schema[runtimeSchema.moduleName][runtimeSchema.code] = runtimeSchema;
                SERVICE.DefaultDatabaseConfigurationService.setRawSchema(SERVICE.DefaultFilesLoaderService.mergeRuntimeSchemaFiles(
                    SERVICE.DefaultDatabaseConfigurationService.getRawSchema(), schema
                ));
                if (runtimeSchema.moduleName === 'default') {
                    _.each(NODICS.getModules(), (moduleObject, moduleName) => {
                        if (moduleObject.rawSchema) {
                            moduleObject.rawSchema = _.merge(moduleObject.rawSchema, schema);
                        }
                    });
                } else {
                    let finalSchema = runtimeSchema;
                    let moduleRawSchema = NODICS.getModule(runtimeSchema.moduleName).rawSchema;
                    if (runtimeSchema.super) {
                        if (!moduleRawSchema[runtimeSchema.super]) {
                            reject(new CLASSES.NodicsError('ERR_DBS_00000', 'Invalid super schema definition, could not found in current module'));
                        } else {
                            finalSchema = _.merge(_.merge({}, moduleRawSchema[runtimeSchema.super]), runtimeSchema);
                        }
                    }
                    moduleRawSchema[runtimeSchema.code] = _.merge(moduleRawSchema[runtimeSchema.code] || {}, finalSchema);
                }
                resolve(true);
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_DBS_00000'));
            }
        });
    },

    /**
     * Resolves schema inheritance for a single module.
     *
     * @param {Object} options Resolution request.
     * @param {string} options.moduleName Owning module name.
     * @param {Object} options.rawSchema Raw schema definitions for the module.
     * @returns {Object} Effective schema definitions keyed by schema code.
     */
    resolveModuleSchemaDependancy: function (options) {
        let _self = this;
        let mergedSchema = {};
        Object.keys(options.rawSchema).forEach(schemaName => {
            if (!mergedSchema[schemaName]) {
                _self.resolveSchemaDependancy({
                    mergedSchema: mergedSchema,
                    rawSchema: options.rawSchema,
                    schemaName: schemaName,
                    schema: options.rawSchema[schemaName]
                });
            }
        });
        return mergedSchema;
    },

    /**
     * Resolves one schema and its parent chain.
     *
     * @param {Object} options Resolution request.
     * @param {Object} options.mergedSchema Accumulator for resolved schemas.
     * @param {Object} options.rawSchema Raw schema definitions in the current module.
     * @param {string} options.schemaName Schema code being resolved.
     * @param {Object} options.schema Raw schema definition.
     * @returns {Object} Effective schema definition with inherited fields and `parents`.
     * @throws {CLASSES.NodicsError} When a parent schema cannot be found.
     */
    resolveSchemaDependancy: function (options) {
        let _self = this;
        if (options.schema.super) {
            let superSchemaName = options.schema.super;
            let superSchema = options.rawSchema[superSchemaName];
            if (superSchema) {
                let finalSchema = {};
                let parents = [];
                if (options.mergedSchema[superSchemaName]) {
                    finalSchema = options.mergedSchema[superSchemaName];
                } else {
                    finalSchema = _self.resolveSchemaDependancy({
                        mergedSchema: options.mergedSchema,
                        rawSchema: options.rawSchema,
                        schemaName: superSchemaName,
                        schema: superSchema
                    });
                }
                if (finalSchema.parents && finalSchema.parents.length > 0) {
                    finalSchema.parents.forEach(element => {
                        parents.push(element);
                    });
                }
                if (!parents.includes(superSchemaName)) {
                    parents.push(superSchemaName);
                }
                options.mergedSchema[options.schemaName] = _.merge(_.merge({}, finalSchema), options.schema);
                options.mergedSchema[options.schemaName].parents = parents;
                return options.mergedSchema[options.schemaName];
            } else {
                throw new CLASSES.NodicsError('ERR_DBS_00000', 'Invalid super schema definition for: ' + options.schemaName);
            }
        } else {
            options.mergedSchema[options.schemaName] = options.schema;
            return options.mergedSchema[options.schemaName];
        }
    }
};
