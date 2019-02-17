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

    imporInternaltData: function (input) {
        return SERVICE.DefaultPipelineService.start('internalDataImportInitializerPipeline', input, {});
    },

    importInitData: function (request) {
        request.dataType = 'init';
        return this.imporInternaltData(request);
    },

    importCoreData: function (request) {
        request.dataType = 'core';
        return this.imporInternaltData(request);
    },

    importSampleData: function (request) {
        request.dataType = 'sample';
        return this.imporInternaltData(request);
    }
};