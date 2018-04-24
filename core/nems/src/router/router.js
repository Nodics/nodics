/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    nems: {
        pushNonSecuredEvent: {
            saveEvent: {
                secured: false,
                key: '/event/push',
                method: 'PUT',
                controller: 'EventController',
                operation: 'save',
                help: {
                    requestType: 'non-secured',
                    message: 'enterpriseCode need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/nems/event/push',
                    body: {
                        enterpriseCode: 'default',
                        event: 'testMe',
                        source: 'cronjob',
                        target: 'profile',
                        nodeId: '0',
                        state: 'NEW',
                        type: 'ASYNC',
                        params: {
                            //any raw data, want to send to handler
                        }
                    }
                }
            },
        },
        processEvent: {
            process: {
                secured: true,
                key: '/event/process',
                method: 'GET',
                controller: 'EventHandlerController',
                operation: 'processEvents',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/nems/event/process',
                }
            }
        }
    }
};