/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nems/interceptors/interceptors
 * @description Schema interceptor registrations that split saved events into concrete targets and process synchronous events immediately.
 * @layer interceptor
 * @owner nems
 * @override Project modules may add later event interceptors through layered interceptor fragments.
 */
module.exports = {
    eventSplitPreSave: {
        type: 'schema',
        item: 'event',
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultEventSplitInterceptorService.eventSplitPreSave'
    },
    eventSplitPostSave: {
        type: 'schema',
        item: 'event',
        trigger: 'postSave',
        active: 'true',
        index: 0,
        handler: 'DefaultEventSplitInterceptorService.handleSyncEvent'
    },
    // eventSplitPostProcessor: {
    //     type: 'schema',
    //     item: 'event',
    //     trigger: 'postSaveProcessor',
    //     active: 'true',
    //     index: 0,
    //     handler: 'DefaultEventSplitInterceptorService.handleSyncEvents'
    // }
};
