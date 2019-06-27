/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: "publishEvents",
        tenant: "default",
        description: 'This job is to trigger process events process, which will push all ASYNC events to target system',
        runOnNode: 0,
        nodeId: 0,
        runOnInit: false,
        active: true,
        logResult: false,
        jobDetail: {
            internal: {
                nodeId: 0,
                module: 'nems',
                method: 'GET',
                uri: '/event/process'
            }
        },
        trigger: {
            expression: "10 * * * * *"
        },
        emails: [{
            email: "nodics.framework@nodics.com"
        }],
        event: {
            completed: true
        },
        priority: 1000,
        status: "NEW",
        state: "NEW"
    }
};