/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: 'publishEvents',
        enterpriseCode: 'default',
        tenant: 'default',
        targetNodeId: 0,
        jobDetail: {
            startNode: 'DefaultEventHandlerJobService.runJob'
        },
        triggers: [{
            isActive: true,
            expression: '*/2 * * * * *'
        }],
        emails: [{
            email: 'nodics.framework@nodics.com'
        }],
        start: new Date(),
        priority: 1000,
        lastResult: 'NEW',
        state: 'NEW'
    }
};