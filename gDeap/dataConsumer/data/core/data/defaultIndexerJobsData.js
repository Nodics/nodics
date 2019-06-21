/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record1: {
        code: "triggerInternalFullIndexer",
        enterpriseCode: "default",
        tenant: "default",
        description: 'This job is to trigger process internal indexer, which will push all data to elastic search',
        runOnNode: 0,
        active: false,
        logResult: false,
        jobDetail: {
            internal: {
                nodeId: 0,
                module: 'dataConsumer',
                method: 'GET',
                uri: '/inetrnalData/search/index/internalDataFullIndexer'
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
        code: "triggerInternalIncrementalIndexer",
        enterpriseCode: "default",
        tenant: "default",
        description: 'This job is to trigger process internal indexer, which will push all data to elastic search',
        runOnNode: 0,
        active: false,
        logResult: false,
        jobDetail: {
            internal: {
                nodeId: 0,
                module: 'dataConsumer',
                method: 'GET',
                uri: '/inetrnalData/search/index/internalDataIncrementalIndexer'
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
        code: "triggerExternalFullIndexer",
        enterpriseCode: "default",
        tenant: "default",
        description: 'This job is to trigger process external data indexer, which will push all data to elastic search',
        runOnNode: 0,
        active: false,
        logResult: false,
        jobDetail: {
            internal: {
                nodeId: 0,
                module: 'dataConsumer',
                method: 'GET',
                uri: '/inetrnalData/search/index/externalDataFullIndexer'
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
        code: "triggerExternalIncrementalIndexer",
        enterpriseCode: "default",
        tenant: "default",
        description: 'This job is to trigger process external data indexer, which will push all data to elastic search',
        runOnNode: 0,
        active: false,
        logResult: false,
        jobDetail: {
            internal: {
                nodeId: 0,
                module: 'dataConsumer',
                method: 'GET',
                uri: '/inetrnalData/search/index/externalDataIncrementalIndexer'
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