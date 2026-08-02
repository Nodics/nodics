/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nems/router/routers
 * @description Secured NEMS route contracts for processing and resetting persisted events.
 * @layer router
 * @owner nems
 * @override Project modules may add or override NEMS routes through later router fragments.
 */
module.exports = {
    nems: {
        processEvent: {
            process: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/event/process',
                method: 'POST',
                controller: 'DefaultEventHandlerController',
                operation: 'processEvents',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/nems/event/process',
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
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'POST',
                    url: 'http://host:port/nodics/nems/event/reset',
                }
            }
        }
    }
};
