/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    system: {
        workflow2Schema: {
            saveWorkflow2Schema: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/workflow/to/schema',
                method: 'PUT',
                controller: 'DefaultWorkflow2SchemaController',
                operation: 'save',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'GET',
                    url: 'http://host:port/nodics/system/workflow/to/schema',
                    body: {
                        workflowCode: 'Code of the workflow needs to be triggered for this schema',
                        schemaName: 'Name of schema',
                        moduleName: 'Module Name of the schema'
                    }
                }
            },
            updateWorkflow2Schema: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/workflow/to/schema',
                method: 'PATCH',
                controller: 'DefaultWorkflow2SchemaController',
                operation: 'update',
                help: {
                    requestType: 'secured',
                    message: 'authToken need to set within header',
                    method: 'PATCH',
                    url: 'http://host:port/nodics/system/workflow/to/schema',
                    body: {
                        query: 'Query to filter targetted items',
                        model: 'Data to update'
                    }
                }
            }
        }
    }
};