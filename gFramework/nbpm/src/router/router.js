/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    system: {
        workflow2SchemaUpdate: {
            saveWorkflow2Schema: {
                secured: true,
                accessGroups: ['adminGroup'],
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
            }
        }
    }
};