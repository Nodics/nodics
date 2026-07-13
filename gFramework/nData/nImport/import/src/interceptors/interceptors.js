/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nData/nImport/import/src/interceptors/interceptors
 * @description Registers nData interceptor wiring for pipeline extension points.
 * @layer interceptors
 * @owner nData
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
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