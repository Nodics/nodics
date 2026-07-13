/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nData/nImport/import/src/service/interceptor/import/defaultMandatePropertyImportInterceptorService
 * @description Implements nData default mandate property import interceptor service business behavior and extension logic.
 * @layer service
 * @owner nData
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



     * Processes mandate properties behavior.



     *



     * @param {*} options Method input.



     * @returns {*} Method result.



     */



    handleMandateProperties: function (options) {
        return new Promise((resolve, reject) => {
            // if (options.models && options.models instanceof Array) {
            //     options.models.forEach(model => {
            //         if (model.entCode && options.entCode && model.entCode !== options.entCode) {
            //             model.entCode = options.entCode;
            //         }

            //         if (model.tenant && options.tenant && model.tenant !== options.tenant) {
            //             model.tenant = options.tenant;
            //         }
            //     });
            // }
            resolve(true);
        });
    }
};