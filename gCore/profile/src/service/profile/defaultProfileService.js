/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/profile/src/service/profile/defaultProfileService
 * @description Implements profile default profile service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
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

    /**

     * Retrieves profile module name information.

     *

     * @returns {*} Method result.

     */

    getProfileModuleName: function () {
        return (typeof CONFIG !== 'undefined' && CONFIG.get && CONFIG.get('profileModuleName')) || 'profile';
    },

    /**

     * Retrieves default tenant information.

     *

     * @returns {*} Method result.

     */

    getDefaultTenant: function () {
        return (typeof CONFIG !== 'undefined' && CONFIG.get && CONFIG.get('defaultTenant')) || 'default';
    },

    /**

     * Validates init required rules.

     *

     * @returns {*} Method result.

     */

    isInitRequired: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            let profileModuleName = _self.getProfileModuleName();
            let defaultTenant = _self.getDefaultTenant();
            let dbConnection = SERVICE.DefaultDatabaseConfigurationService.getTenantDatabase(profileModuleName, defaultTenant);
            if (dbConnection) {
                let masterDatabase = dbConnection.master;
                if (!masterDatabase.getCollectionList() || masterDatabase.getCollectionList().length <= 0) {
                    _self.LOG.info('System requires initial data to be imported');
                    resolve(true);
                } else {
                    NODICS.getModels(profileModuleName, defaultTenant).EnterpriseModel.getItems({
                        tenant: defaultTenant
                    }).then(success => {
                        let enterprises = UTILS.isArray(success) ? success : success.result;
                        resolve(!enterprises || enterprises.length <= 0);
                    }).catch(error => {
                        reject(error);
                    });
                }
            } else {
                reject(new CLASSES.NodicsError('ERR_DBS_00001', 'Invalid database connection handler found for module: ' + profileModuleName + ', and tenant: ' + defaultTenant));
            }
        });
    }
};
