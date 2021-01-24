/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    data: {
        dataImportPhasesLimit: 5,
        finalizeImportDataAsync: true,
        importDataConvertEncoding: 'utf8',
        readBufferSize: 1024,
        headerBatchSize: 0
    },

    defaultErrorCodes: {
        DataImportError: 'ERR_IMP_00000'
    }
};