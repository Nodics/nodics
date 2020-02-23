/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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

    isInitRequired: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            let dbConnection = SERVICE.DefaultDatabaseConfigurationService.getTenantDatabase('profile', 'default');
            if (dbConnection) {
                let masterDatabase = dbConnection.master;
                if (!masterDatabase.getCollectionList() || masterDatabase.getCollectionList().length <= 0) {
                    _self.LOG.info('System requires initial data to be imported');
                    resolve(true);
                } else {
                    NODICS.getModels('profile', 'default').EnterpriseModel.getItems({
                        tenant: 'default'
                    }).then(success => {
                        if (success && success.length > 0) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    }).catch(error => {
                        reject(error);
                    });
                }
            } else {
                reject(new CLASSES.NodicsError('ERR_DBS_00001', 'Invalid database connection handler found for module: profile, and tenant: default'));
            }
        });
    }
};