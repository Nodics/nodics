/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
