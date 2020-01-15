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
                    body: [{
                        tenant: 'Required tenant',
                        itemCode: 'Required item code',
                        schemaName: 'Either schema name or index name',
                        indexName: 'Either schema name or index name',
                        moduleName: 'Required module name',
                        workflowCodes: 'Required list code of workflow head'
                    }]
                }
            },

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

            performAction: {
                secured: true,
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