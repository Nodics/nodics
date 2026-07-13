/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nValidator/nodics
 * @description Registers the nValidator module lifecycle hooks and module-level startup behavior.
 * @layer module
 * @owner nValidator
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
            this.LOG.debug('Collecting validator definitions');
            let loadValidators = () => {
                SERVICE.DefaultValidatorService.loadValidators().then(done => {
                    resolve(done);
                }).catch(error => {
                    reject(error);
                });
            };
            if (!SERVICE.DefaultInterceptorService || typeof SERVICE.DefaultInterceptorService.get !== 'function') {
                this.LOG.warn('Persisted interceptor loading skipped; no interceptor model service is available');
                loadValidators();
                return;
            }
            SERVICE.DefaultInterceptorService.get({
                tenant: CONFIG.get('defaultTenant') || 'default'
            }).then(response => {
                try {
                    if (response.success && response.result.length > 0) {
                        let interceptors = {};
                        response.result.forEach(interceptor => {
                            interceptors[interceptor.code] = interceptor;
                        });
                        SERVICE.DefaultInterceptorService.loadRawInterceptors(interceptors);
                        SERVICE.DefaultDatabaseConfigurationService.setSchemaInterceptors({});
                    }
                    loadValidators();
                } catch (error) {
                    reject(error);
                }
            }).catch(error => {
                reject(error);
            });

        });
    },
};
