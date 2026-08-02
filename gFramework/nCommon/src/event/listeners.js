/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nCommon/event/listeners
 * @description Event-listener definitions that refresh effective interceptor configuration after interceptor records are created or updated.
 * @layer event
 * @owner nCommon
 * @override Later modules may add listeners or override handlers through layered event definitions while preserving tenant-aware runtime refresh behavior.
 */
module.exports = {
    common: {
        interceptorAddedListener: {
            event: 'interceptorSave',
            listener: 'DefaultInterceptorChangeListenerService.handleInterceptorChangeEvent'
        },
        interceptorUpdatedListener: {
            event: 'interceptorUpdated',
            listener: 'DefaultInterceptorChangeListenerService.handleInterceptorChangeEvent'
        }
    }
};
