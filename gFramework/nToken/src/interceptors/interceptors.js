/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nToken/src/interceptors/interceptors
 * @description Registers nToken interceptor wiring for pipeline extension points.
 * @layer interceptors
 * @owner nToken
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    tokenPreGet: {
        type: 'schema',
        item: 'token',
        trigger: 'preGet',
        active: 'true',
        index: 0,
        handler: 'DefaultTokenValidityCheckInterceptorService.fetchValidToken'
    }
};