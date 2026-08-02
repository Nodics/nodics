/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nems/data/core/headers/job/defaultEventPublishingJobHeader
 * @description Import header for saving the default asynchronous event publishing cronjob.
 * @layer data
 * @owner nems
 * @override Project modules may add later headers for custom event processing jobs.
 */
module.exports = {
    cronjob: {
        defaultEventPublishingJob: {
            options: {
                enabled: true,
                schemaName: 'cronJob',
                operation: 'saveAll', //saveAll, update and saveOrUpdate
                tenants: ['default'],
                dataFilePrefix: 'defaultEventPublishingJobData'
            },
            query: {
                code: '$code'
            }
        }
    }
};
