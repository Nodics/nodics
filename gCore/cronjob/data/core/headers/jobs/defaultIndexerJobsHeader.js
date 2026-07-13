/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cronjob/data/core/headers/jobs/defaultIndexerJobsHeader
 * @description Import header for saving default cronjob records related to indexing.
 * @layer data
 * @owner cronjob
 * @override Project modules may add later headers for customer-specific scheduled job data.
 */
module.exports = {
    cronjob: {
        indexerJob: {
            options: {
                enabled: true,
                schemaName: 'cronJob',
                operation: 'saveAll',
                //tenants: ['default'],
                dataFilePrefix: 'defaultIndexerJobsData'
            },
            query: {
                code: '$code'
            }
        }
    }
};
