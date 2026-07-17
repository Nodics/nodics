/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cronjob/event/listeners
 * @description Event listener registrations for refreshing cronjob interceptor and validator runtime caches.
 * @layer event
 * @owner cronjob
 * @override Project modules may add later listeners for cronjob configuration events.
 */
module.exports = {
    common: {
        jobInterceptorUpdatedListener: {
            event: 'jobInterceptorUpdated',
            listener: 'DefaultCronJobConfigurationService.handleJobInterceptorUpdated'
        },
        jobValidatorUpdatedListener: {
            event: 'jobValidatorUpdated',
            listener: 'DefaultCronJobConfigurationService.handleJobValidatorUpdated'
        }
    }
};
