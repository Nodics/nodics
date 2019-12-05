/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    defaultImportDataProcessor: {
        type: 'import',
        trigger: 'import',
        active: 'true',
        index: 0,
        handler: 'DefaultMandatePropertyImportInterceptorService.handleMandateProperties'
    },
    defaultImportEnterpriseDataProcessor: {
        type: 'import',
        item: 'enterprise',
        trigger: 'import',
        active: 'true',
        index: 0,
        handler: 'DefaultSampleImportInterceptorService.handleEnterpriseImportProcessor'
    }
};