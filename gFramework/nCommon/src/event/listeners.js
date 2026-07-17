/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
