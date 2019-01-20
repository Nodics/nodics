/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    /**
     * This function is used to setup your service just after service is loaded.
     */
    init: function () {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to setup your service just before routers are getting activated.
     */
    postInit: function () {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    isSearchEnabled: function (moduleName, tntCode, indexTypeName) {
        let flag = false;
        try {
            let searchEngine = NODICS.getTenantSearchEngine(moduleName, tntCode);
            if (searchEngine) {
                let indexDef = NODICS.getTenantRawSearchSchema(moduleName, tntCode, indexTypeName);
                if (indexDef) {
                    flag = indexDef.enabled || false;
                } else {
                    this.LOG.warn('Search schema not available for module: ' + moduleName + ', tenant: ' + tntCode + ', index type: ' + indexTypeName);
                }
            } else {
                this.LOG.warn('Search engine not available for module: ' + moduleName + ' and tenant: ' + tntCode);
            }
        } catch (error) {
            this.LOG.error('Please validate search configuration.');
            this.LOG.error(error);
        }
        return flag;
    }
};