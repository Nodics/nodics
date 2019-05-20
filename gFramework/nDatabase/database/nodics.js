/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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
                return SERVICE.DefaultDatabaseSchemaHandlerService.buildDatabaseSchema();
            }).then(() => {
                NODICS.addTenant('default');
                return SERVICE.DefaultDatabaseModelHandlerService.buildModelsForTenant();
            }).then(() => {
                return SERVICE.DefaultDatabaseConnectionHandlerService.isInitRequired();
            }).then(() => {
                return new Promise((resolve, reject) => {
                    this.LOG.debug('Collecting database interceptors definitions');
                    let interceptors = SERVICE.DefaultInterceptorHandlerService.buildInterceptors(SERVICE.DefaultFilesLoaderService.loadFiles('/src/interceptors/schema/interceptors.js'));
                    SERVICE.DefaultDatabaseConfigurationService.setInterceptors(interceptors);
                    resolve(true);
                });
            }).then(() => {
                return new Promise((resolve, reject) => {
                    if (NODICS.isModuleActive(CONFIG.get('profileModuleName'))) {
                        let defaultAuthDetail = CONFIG.get('defaultAuthDetail') || {};
                        let authToken = SERVICE.DefaultAuthenticationProviderService.generateAuthToken({
                            enterpriseCode: defaultAuthDetail.enterpriseCode,
                            tenant: defaultAuthDetail.tenant,
                            apiKey: CONFIG.get('defaultAuthDetail').apiKey,
                            lifetime: true
                        });
                        NODICS.addInternalAuthToken('default', authToken);
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