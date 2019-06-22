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

    removeTenants: function (tenants) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                if (tenants && tenants.length > 0) {
                    tenants.forEach(tenant => {
                        NODICS.removeActiveTenant(tenant);
                        if (SERVICE.DefaultCronJobService) {
                            SERVICE.DefaultCronJobService.getCronJobContainer().removeAllJobs([tenant]).then(success => {
                                _self.LOG.info('All job removed successfully for thenant: ' + tenant);
                            }).catch(error => {
                                _self.LOG.error('Failed removing jobs for tenant: ' + tenant);
                            });
                        }
                        _.each(NODICS.getModules(), (moduleObject, moduleName) => {
                            SERVICE.DefaultDatabaseConnectionHandlerService.removeTenantDatabase(moduleName, tenant).then(success => {
                                SERVICE.DefaultDatabaseModelHandlerService.removeModelsForTenant(moduleName, tenant).then(success => {
                                    if (NODICS.isModuleActive('search')) {
                                        SERVICE.DefaultSearchConfigurationService.removeTenantSearchEngine(moduleName, tenant);
                                        SERVICE.DefaultSearchConfigurationService.removeTenantRawSearchSchema(moduleName, tenant);
                                        if (moduleObject.searchModels[tenant]) delete moduleObject.searchModels[tenant];
                                    }

                                    resolve({
                                        success: true,
                                        code: 'SUC_SYS_00000',
                                        msg: 'Tenant successfully deactivated'
                                    });
                                }).catch(error => {
                                    reject(error);
                                });
                            }).catch(error => {
                                reject(error);
                            });
                        });
                    });
                }
            } catch (error) {
                reject(error);
            }
        });
    }
};