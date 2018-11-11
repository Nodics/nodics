/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    importInitData: function (input) {
        return SERVICE.DefaultImportService.importInitData(input);
    },

    importCoreData: function (input) {
        return SERVICE.DefaultImportService.importCoreData(input);
    },

    importSampleData: function (input) {
        return SERVICE.DefaultImportService.importSampleData(input);
    }
};