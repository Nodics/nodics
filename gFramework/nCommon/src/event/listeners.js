/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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