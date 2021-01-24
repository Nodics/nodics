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
                SERVICE.DefaultDatabaseConfigurationService.setRawSchema(SERVICE.DefaultFilesLoaderService.loadFiles('/src/schemas/schemas.js', null));
                return new Promise((resolve, reject) => {
                    SERVICE.DefaultDatabaseConnectionHandlerService.getRuntimeSchema().then(runtimeSchema => {
                        SERVICE.DefaultDatabaseConfigurationService.setRawSchema(_.merge(
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
                NODICS.addActiveEnterprise('default', 'default');
                NODICS.addActiveTenant('default');
                return SERVICE.DefaultDatabaseModelHandlerService.buildModelsForTenant();
            }).then(() => {
                return SERVICE.DefaultDatabaseConnectionHandlerService.isInitRequired();
            }).then(() => {
                return new Promise((resolve, reject) => {
                    if (NODICS.isModuleActive(CONFIG.get('profileModuleName'))) {
                        // let defaultAuthDetail = CONFIG.get('defaultAuthDetail') || {};
                        // let authToken = SERVICE.DefaultAuthenticationProviderService.generateAuthToken({
                        //     entCode: defaultAuthDetail.entCode,
                        //     tenant: defaultAuthDetail.tenant,
                        //     apiKey: CONFIG.get('defaultAuthDetail').apiKey,
                        //     lifetime: true
                        // });
                        // NODICS.addInternalAuthToken('default', authToken);
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