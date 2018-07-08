/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    importData: function (input) {
        try {
            return new Promise((resolve, reject) => {
                input.promise = {
                    resolve: resolve,
                    reject: reject
                }
                SERVICE.PipelineService.startPipeline('defaultDataImportPipeline', input, {});
            });
        } catch (error) {
            return Promise.reject(error);
        }
    },

    importInitData: function (request, callback) {
        let input = request.local || request;
        input.dataType = 'init';

        if (callback) {
            his.importData(input).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return this.importData(input);
        }
    },

    importCoreData: function (request, callback) {
        let input = request.local || request;
        input.dataType = 'core';
        if (callback) {
            his.importData(input).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return this.importData(input);
        }
    },

    importSampleData: function (request, callback) {
        let input = request.local || request;
        input.dataType = 'sample';
        if (callback) {
            his.importData(input).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return this.importData(input);
        }
    }

    /*
        processDataImport: function (input, callback) {
            let _self = this;
    
    
    
    
    
            let dataType = 'init';
            SERVICE.InternalDataLoadService.getInternalFiles(['profile', 'sampleServer']).then(fileList => {
                console.log(fileList);
            }).catch(error => {
                console.log(error);
            });
            SERVICE.InternalDataLoadService.getExternalFiles(NODICS.getNodicsHome() + '/tmp').then(fileList => {
                console.log(fileList);
            }).catch(error => {
                console.log(error);
            });
        },
    */
};