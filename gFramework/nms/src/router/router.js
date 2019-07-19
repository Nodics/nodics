/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    common: {
        nodeStateChanges: {
            nodeActivatedPost: {
                secured: true,
                key: '/node/active',
                method: 'POST',
                controller: 'DefaultNodeManagerController',
                operation: 'handleNodeActivated',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/node/active',
                    body: {
                        nodeId: 'activated node nodeId'
                    }
                }
            }
        },

        stopNodeHealthCheck: {
            stopNodeHealthCheckGet: {
                secured: true,
                key: '/node/health/check/stop',
                method: 'GET',
                controller: 'DefaultNodeManagerController',
                operation: 'stopHealthCheck',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/{moduleName}/node/health/check/stop',
                }
            }
        }
    }
};