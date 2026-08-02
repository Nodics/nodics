/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cronjob/data/core/data/jobs/defaultIndexerJobsData
 * @description Core initializer data for default cronjob records related to indexing.
 * @layer data
 * @owner cronjob
 * @override Project modules may contribute later job data for customer-specific scheduled work.
 */
module.exports = {
    record1: {
        code: "jobLogFullIndexerJob",
        description: 'This job is to trigger process job log indexer, which will push all data to elastic search',
        runOnNode: 'node0',
        active: false,
        logResult: false,
        jobDetail: {
            internal: {
                nodeId: 'node0',
                module: 'cronjob',
                method: 'GET',
                uri: '/cronJobLog/search/index/jobLogFullIndexer'
            }
        },
        trigger: {
            expression: "0 0 1 * * *"
        },
        emails: [{
            email: "nodics.framework@nodics.com"
        }],
        priority: 1000,
        status: "NEW",
        state: "NEW"
    },

    record2: {
        code: "jobLogIncrementalIndexerJob",
        description: 'This job is to trigger process job log indexer, which will push all data to elastic search',
        runOnNode: 'node0',
        active: false,
        logResult: false,
        jobDetail: {
            internal: {
                nodeId: 'node0',
                module: 'cronjob',
                method: 'GET',
                uri: '/cronJobLog/search/index/jobLogIncrementalIndexer'
            }
        },
        trigger: {
            expression: "0 */1 * * * *"
        },
        emails: [{
            email: "nodics.framework@nodics.com"
        }],
        priority: 1000,
        status: "NEW",
        state: "NEW"
    }
};
