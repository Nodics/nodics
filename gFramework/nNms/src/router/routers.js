/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nNms/src/router/routers
 * @description Defines nNms route registration and HTTP exposure metadata.
 * @layer router
 * @owner nNms
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    common: {
        nodeStateChanges: {
            nodeActivatedPost: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/node/active/:nodeId',
                method: 'POST',
                controller: 'DefaultNodeManagerController',
                operation: 'handleNodeActivated',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/node/active/:nodeId',
                }
            },

            requestResponsibilityPost: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/node/request/responsibility/:nodeId',
                method: 'POST',
                controller: 'DefaultNodeManagerController',
                operation: 'requestResponsibility',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/node/request/responsibility/:nodeId',
                }
            }
        },

        stopNodeHealthCheck: {
            stopNodeHealthCheckPost: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/node/health/check/stop',
                method: 'POST',
                controller: 'DefaultNodeManagerController',
                operation: 'stopHealthCheck',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/{moduleName}/node/health/check/stop',
                }
            }
        }
    }
};
