/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    workflow: {
        workflowOperations: {
            addItems: {
                secured: true,
                key: '/item',
                method: 'PUT',
                controller: 'DefaultWorkflowController',
                operation: 'addItems',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'put',
                    url: 'http://host:port/nodics/workflow/item/add',
                    body: {
                        workflowCode: 'Workflow code, these items needs to be associated',
                        itemType: 'Type of item, is it INTERNAL or EXTERNAL',
                        items: [{
                            itemCode: 'Required item code',
                            schemaName: 'Either schema name or index name',
                            indexName: 'Either schema name or index name',
                            moduleName: 'Required module name',
                            callbackData: 'Any JSON object needs to be send back along with each events'
                        }]
                    }
                }
            },

            performAction: {
                secured: true,
                key: '/action/process',
                method: 'POST',
                controller: 'DefaultWorkflowController',
                operation: 'performAction',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/workflow/action/process',
                    body: {
                        workflowCode: 'Code of the workflow',
                        actionCode: 'Code of the action, if null, workflow head will be current action',
                        itemCodes: 'List of workflow item codes to perform action',
                        actionResponse: {
                            default: {
                                decision: 'Decision that has been taken',
                                feedback: 'Either json object or simple message'
                            },
                            'itemCode': {
                                decision: 'Decision that has been taken',
                                feedback: 'Either json object or simple message'
                            }
                        }
                    }
                }
            },

            /* ===================================================================== */
            startWorkflow: {
                secured: true,
                key: '/start/:itemCode',
                method: 'POST',
                controller: 'DefaultWorkflowController',
                operation: 'startWorkflow',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'POST',
                    url: 'http://host:port/nodics/workflow/start/:itemCode',
                    body: {
                        decision: 'Decision that has been taken',
                        feedback: 'Either json object or simple message'
                    }
                }
            },

            removeItem: {
                secured: true,
                key: '/item/:itemCode',
                method: 'DELETE',
                controller: 'DefaultWorkflowController',
                operation: 'removeItem',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'DELETE',
                    url: 'http://host:port/nodics/workflow/item/:itemCode',
                    body: 'Either json object or simple message'
                }
            },

            disableItem: {
                secured: true,
                key: '/item/disable/:itemCode',
                method: 'DELETE',
                controller: 'DefaultWorkflowController',
                operation: 'disableItem',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'DELETE',
                    url: 'http://host:port/nodics/workflow/item/disable/:itemCode',
                    body: 'Either json object or simple message'
                }
            },

            resumeItem: {
                secured: true,
                key: '/item/resume/:itemCode',
                method: 'POST',
                controller: 'DefaultWorkflowController',
                operation: 'resumeItem',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'DELETE',
                    url: 'http://host:port/nodics/workflow/item/resume/:itemCode',
                    body: 'Either json object or simple message'
                }
            }
        },
    }
};