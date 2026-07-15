/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
                method: 'GET',
                controller: 'DefaultEventHandlerController',
                operation: 'processEvents',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
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
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
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
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'GET',
                    url: 'http://host:port/nodics/nems/event/reset',
                }
            }
        }
    }
};
