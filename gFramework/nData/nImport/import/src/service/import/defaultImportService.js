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

    importInitData: function (request) {
        request.dataType = 'init';
        return SERVICE.DefaultPipelineService.start('systemDataImportInitializerPipeline', request, {});
    },

    importCoreData: function (request) {
        request.dataType = 'core';
        return SERVICE.DefaultPipelineService.start('systemDataImportInitializerPipeline', request, {});
    },

    importSampleData: function (request) {
        request.dataType = 'sample';
        return SERVICE.DefaultPipelineService.start('systemDataImportInitializerPipeline', request, {});
    },

    importLocalData: function (request) {
        return SERVICE.DefaultPipelineService.start('localDataImportInitializerPipeline', request, {});
    },

    importRemoteData: function (request) {
        return SERVICE.DefaultPipelineService.start('remoteDataImportInitializerPipeline', request, {});
    },

    processImportData: function (request) {
        return SERVICE.DefaultPipelineService.start('processDataImportPipeline', request, {});
    }
};