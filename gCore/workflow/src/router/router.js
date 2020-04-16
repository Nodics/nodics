/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    workflow: {
        workflowItemOperations: {
            initItem: {
                secured: true,
                accessGroups: ['adminGroup'],
                key: '/item/init',
                method: 'PUT',
                controller: 'DefaultWorkflowController',
                operation: 'initItem',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'put',
                    url: 'http://host:port/nodics/workflow/init',
                    body: {
                        workflowCode: 'Workflow code, these items needs to be associated',
                        itemType: 'Type of item, is it INTERNAL or EXTERNAL',
                        item: {
                            code: 'Required item code',
                            refId: 'external item reference id',
                            callbackData: 'Any JSON object needs to be send back along with each events',
                            detail: {
                                schemaName: 'Either schema name or index name, in case internal',
                                indexName: 'Either schema name or index name, in case internal',
                                moduleName: 'Required module name, in case internal',
                            }
                        }
                    }
                }
            },
            pauseItem: {
                secured: true,
                accessGroups: ['adminGroup'],
                key: '/item/pause/:itemCode',
                method: 'POST',
                controller: 'DefaultWorkflowController',
                operation: 'pauseItem',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/workflow/pause/:itemCode',
                    body: 'Comments for this action'
                }
            },
            resumeItem: {
                secured: true,
                accessGroups: ['adminGroup'],
                key: '/item/resume/:itemCode',
                method: 'POST',
                controller: 'DefaultWorkflowController',
                operation: 'resumeItem',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/workflow/resume/:itemCode',
                    body: 'Comments for this action'
                }
            },

            nextAction: {
                secured: true,
                accessGroups: ['workflowUserGroup'],
                key: '/item/next/action/:itemCode/:actionCode',
                method: 'POST',
                controller: 'DefaultWorkflowController',
                operation: 'nextAction',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'put',
                    url: 'http://host:port/nodics/workflow/item/next/action/:itemCode/:actionCode'
                }
            }
        },
        workflowActionOperations: {
            performAction: {
                secured: true,
                accessGroups: ['adminGroup'],
                key: '/action/process/:itemCode',
                method: 'POST',
                controller: 'DefaultWorkflowController',
                operation: 'performAction',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/workflow/action/process/:itemCode',
                    body: {
                        decision: 'Decision that has been taken',
                        feedback: 'Either json object or simple message'
                    }
                }
            }
        }
    }
};