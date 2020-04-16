/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    nems: {
        processEvent: {
            process: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/event/process',
                method: 'GET',
                controller: 'DefaultEventHandlerController',
                operation: 'processEvents',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/nems/event/process',
                }
            },
            resetAll: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/event/reset',
                method: 'GET',
                controller: 'DefaultEventHandlerController',
                operation: 'resetEvents',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/nems/event/reset',
                }
            },

            resetQuery: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/event/reset',
                method: 'POST',
                controller: 'DefaultEventHandlerController',
                operation: 'resetEvents',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/nems/event/reset',
                }
            }
        }
    }
};