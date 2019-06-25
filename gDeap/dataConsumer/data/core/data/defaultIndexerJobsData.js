/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record1: {
        code: "jobInternalFullIndexer",
        description: 'This job is to trigger process internal indexer, which will push all data to elastic search',
        runOnNode: 0,
        active: false,
        logResult: false,
        jobDetail: {
            internal: {
                nodeId: 0,
                module: 'dataConsumer',
                method: 'GET',
                uri: '/internalData/search/index/internalDataFullIndexer'
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
        code: "jobInternalIncrementalIndexer",
        description: 'This job is to trigger process internal indexer, which will push all data to elastic search',
        runOnNode: 0,
        active: false,
        logResult: false,
        jobDetail: {
            internal: {
                nodeId: 0,
                module: 'dataConsumer',
                method: 'GET',
                uri: '/internalData/search/index/internalDataIncrementalIndexer'
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
    },
    record3: {
        code: "jobExternalFullIndexer",
        description: 'This job is to trigger process external data indexer, which will push all data to elastic search',
        runOnNode: 0,
        active: false,
        logResult: false,
        jobDetail: {
            internal: {
                nodeId: 0,
                module: 'dataConsumer',
                method: 'GET',
                uri: '/externalData/search/index/externalDataFullIndexer'
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
    record4: {
        code: "jobExternalIncrementalIndexer",
        description: 'This job is to trigger process external data indexer, which will push all data to elastic search',
        runOnNode: 0,
        active: false,
        logResult: false,
        jobDetail: {
            internal: {
                nodeId: 0,
                module: 'dataConsumer',
                method: 'GET',
                uri: '/externalData/search/index/externalDataIncrementalIndexer'
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