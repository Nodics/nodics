/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    importData: function (input) {
        return SERVICE.DefaultPipelineService.start('dataImportInitializerPipeline', input, {});
    },

    importInitData: function (request, callback) {
        let input = request.local || request;
        input.dataType = 'init';
        if (callback) {
            this.importData(input).then(success => {
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
            this.importData(input).then(success => {
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
            this.importData(input).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return this.importData(input);
        }
    }
};