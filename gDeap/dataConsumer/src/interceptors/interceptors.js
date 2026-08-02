/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gDeap/dataConsumer/src/interceptors/interceptors
 * @description Registers dataConsumer interceptor wiring for pipeline extension points.
 * @layer interceptors
 * @owner dataConsumer
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    importDefaultDateConverter: {
        type: 'import',
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultStartValueValidatorInterceptorService.convertToDate'
    },

    activateJobAfterImport: {
        type: 'import',
        item: 'internalData',
        trigger: 'preSave',
        active: 'true',
        index: 9999999,
        handler: 'DefaultJobActivatorInterceptorService.activateJob'
    }
};