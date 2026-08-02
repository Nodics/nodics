/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/vDatabase/interceptors/VersionedDatabaseInterceptors
 * @description Versioned schema interceptor registry. It attaches version id
 * initialization to generated save operations for version-aware database models.
 * @layer interceptor
 * @owner nDatabase
 * @override Project modules may override or extend these definitions to
 * implement stricter optimistic locking or version mutation policies.
 *
 * @property {Object} publishPreSave preSave version id initialization interceptor.
 */
module.exports = {
    publishPreSave: {
        type: 'schema',
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultVersionIdHandlerInterceptorService.updateVersionId'
    },

    // publishPreUpdate: {
    //     type: 'schema',
    //     trigger: 'preUpdate',
    //     active: 'true',
    //     index: 0,
    //     handler: 'DefaultVersionIdHandlerInterceptorService.updateVersionId'
    // }
};
