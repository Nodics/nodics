/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    common: {
        moduleEventRouters: {
            eventTriggered: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/event/handle',
                method: 'POST',
                controller: 'DefaultEventController',
                operation: 'handleEvent'
            }
        }
    }
};