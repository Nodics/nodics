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

    handleConfigurationChangeEvent: function (request) {
        return new Promise((resolve, reject) => {
            try {
                this.get({
                    authData: request.authData,
                    tenant: request.tenant,
                    searchOptions: {
                        projection: { _id: 0 }
                    },
                    query: {
                        code: {
                            $in: request.event.data.models
                        }
                    }
                }).then(success => {
                    if (success.result && success.result.length > 0) {
                        success.result.forEach(configuration => {
                            CONFIG.changeTenantProperties(configuration.config, request.tenant);
                        });
                    }
                    resolve('Configuration update successfully');
                }).catch(error => {
                    reject(error);
                });
            } catch (error) {
                reject(new CLASSES.NodicsError(error));
            }
        });
    }
};