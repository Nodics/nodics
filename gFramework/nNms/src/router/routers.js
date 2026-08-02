/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
