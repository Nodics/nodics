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
            initItem: {
                secured: true,
                key: '/init',
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
                            schemaName: 'Either schema name or index name',
                            indexName: 'Either schema name or index name',
                            moduleName: 'Required module name',
                            callbackData: 'Any JSON object needs to be send back along with each events',
                            detail: 'JSON object if item is external'
                        }
                    }
                }
            },

            nextAction: {
                secured: true,
                key: '/action/next/:itemCode/:actionCode',
                method: 'POST',
                controller: 'DefaultWorkflowController',
                operation: 'nextAction',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'put',
                    url: 'http://host:port/nodics/workflow/action/next/:itemCode/:actionCode'
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
        }
    }
};