/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nDatabase/database/nodics
 * @description Registers the nDatabase module lifecycle hooks and module-level startup behavior.
 * @layer module
 * @owner nDatabase
 * @override Projects may override lifecycle behavior through later active modules instead of modifying this module directly.
 */
module.exports = {
    /**
     * This function is used to initiate module loading process. If there is any functionalities, required to be executed on module loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize module loading process. If there is any functionalities, required to be executed after module loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            this.LOG.info('Starting database configuration process');
            SERVICE.DefaultDatabaseConnectionHandlerService.createDatabaseConnection().then(() => {
                SERVICE.DefaultDatabaseConfigurationService.setRawSchema(SERVICE.DefaultFilesLoaderService.loadSchemaFiles('/src/schemas/schemas.js', null));
                return new Promise((resolve, reject) => {
                    SERVICE.DefaultDatabaseConnectionHandlerService.getRuntimeSchema().then(runtimeSchema => {
                        SERVICE.DefaultDatabaseConfigurationService.setRawSchema(SERVICE.DefaultFilesLoaderService.mergeRuntimeSchemaFiles(
                            SERVICE.DefaultDatabaseConfigurationService.getRawSchema(),
                            runtimeSchema
                        ));
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                });
            }).then(() => {
                return SERVICE.DefaultDatabaseSchemaHandlerService.buildDatabaseSchema(SERVICE.DefaultDatabaseConfigurationService.getRawSchema());
            }).then(() => {
                let defaultEnterprise = CONFIG.get('defaultEnterprise') || 'default';
                let defaultTenant = CONFIG.get('defaultTenant') || 'default';
                NODICS.addActiveEnterprise(defaultEnterprise, defaultTenant);
                NODICS.addActiveTenant(defaultTenant);
                return SERVICE.DefaultDatabaseModelHandlerService.buildModelsForTenant();
            }).then(() => {
                return SERVICE.DefaultDatabaseConnectionHandlerService.isInitRequired();
            }).then(() => {
                return new Promise((resolve, reject) => {
                    if (NODICS.isModuleActive(CONFIG.get('profileModuleName'))) {
                        resolve(true);
                    } else {
                        resolve(true);
                    }
                });
            }).then(() => {
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    },
};
