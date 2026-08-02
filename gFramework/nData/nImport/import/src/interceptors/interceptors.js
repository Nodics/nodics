/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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