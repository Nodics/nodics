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
                reject(error);
            }

        });
    },

    buildRuntimeSchema: function (runtimeSchema) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let schema = {};
                schema[runtimeSchema.moduleName] = {};
                schema[runtimeSchema.moduleName][runtimeSchema.code] = runtimeSchema;
                SERVICE.DefaultDatabaseConfigurationService.setRawSchema(_.merge(
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
                            _self.LOG.error('Invalid super schema definition, could not found in current module');
                            reject('Invalid super schema definition, could not found in current module');
                        } else {
                            finalSchema = _.merge(_.merge({}, moduleRawSchema[runtimeSchema.super]), runtimeSchema);
                        }
                    }
                    moduleRawSchema[runtimeSchema.code] = _.merge(moduleRawSchema[runtimeSchema.code] || {}, finalSchema);
                }
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

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
                throw new Error('Invalid super schema definition for: ' + options.schemaName);
            }
        } else {
            options.mergedSchema[options.schemaName] = options.schema;
            return options.mergedSchema[options.schemaName];
        }
    }
};