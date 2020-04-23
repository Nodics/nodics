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
                accessGroups: ['userGroup'],
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
                            sourceDetail: {
                                schemaName: 'Either schema name or index name, in case internal',
                                indexName: 'Either schema name or index name, in case internal',
                                moduleName: 'Required module name, in case internal',
                                endPoint: 'In case external item'
                            },
                            itemDetail: 'Complete item detail, which required on workflow action to perform'
                        }
                    }
                }
            },
            pauseItem: {
                secured: true,
                accessGroups: ['workflowUserGroup'],
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
                accessGroups: ['workflowUserGroup'],
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
            }
        },
        workflowActionOperations: {
            performAction: {
                secured: true,
                accessGroups: ['workflowUserGroup'],
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
        },
        retrieveWorkflow: {
            getWorkflowChain: {
                secured: true,
                accessGroups: ['workflowUserGroup'],
                key: '/chain/:workflowCode',
                method: 'GET',
                controller: 'DefaultWorkflowController',
                operation: 'getWorkflowChain',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/workflow/chain/:workflowCode',
                }
            },
            getWorkflowsChain: {
                secured: true,
                accessGroups: ['workflowUserGroup'],
                key: '/chain',
                method: 'POST',
                controller: 'DefaultWorkflowController',
                operation: 'getWorkflowChain',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/workflow/chain',
                    body: {
                        options: {
                            recursive: 'true/false and other serach options'
                        },
                        query: 'Query object to find workflows'
                    }
                }
            }
        }
    }
};