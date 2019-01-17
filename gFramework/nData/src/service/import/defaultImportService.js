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

    importInitData: function (request) {
        request.dataType = 'init';
        return this.importData(request);
    },

    importCoreData: function (request) {
        request.dataType = 'core';
        return this.importData(request);
    },

    importSampleData: function (request) {
        request.dataType = 'sample';
        return this.importData(request);
    }
};