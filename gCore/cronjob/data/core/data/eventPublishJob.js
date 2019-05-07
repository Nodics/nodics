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
        enterpriseCode: "default",
        tenant: "default",
        runOnNode: 0,
        active: true,
        logResult: false,
        jobDetail: {
            //startNode: "DefaultEventHandlerJobService.runJob"
            nodeId: 0,
            module: 'nems',
            method: 'GET',
            uri: '/event/process',
            // payload: {}
        },
        trigger: {
            expression: "10 * * * * *"
        },
        emails: [{
            email: "nodics.framework@nodics.com"
        }],
        start: "2018-11-15T02:30:20.430Z",
        priority: 1000,
        status: "NEW",
        state: "NEW"
    }
};