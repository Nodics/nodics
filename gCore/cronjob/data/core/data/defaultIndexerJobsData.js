/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record1: {
        code: "triggerJobLogFullIndexer",
        enterpriseCode: "default",
        tenant: "default",
        description: 'This job is to trigger process job log indexer, which will push all data to elastic search',
        runOnNode: 0,
        active: true,
        logResult: false,
        jobDetail: {
            internal: {
                nodeId: 0,
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
        code: "triggerJobLogIncrementalIndexer",
        enterpriseCode: "default",
        tenant: "default",
        description: 'This job is to trigger process job log indexer, which will push all data to elastic search',
        runOnNode: 0,
        active: true,
        logResult: false,
        jobDetail: {
            internal: {
                nodeId: 0,
                module: 'cronjob',
                method: 'GET',
                uri: '/cronJobLog/search/index/jobLogIncrementalIndexer'
            }
        },
        trigger: {
            expression: "0 */10 * * * *"
        },
        emails: [{
            email: "nodics.framework@nodics.com"
        }],
        priority: 1000,
        status: "NEW",
        state: "NEW"
    }
};