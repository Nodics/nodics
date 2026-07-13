/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
