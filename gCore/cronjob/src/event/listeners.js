/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
