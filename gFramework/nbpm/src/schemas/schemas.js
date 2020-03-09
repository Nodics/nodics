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
            super: 'super',
            model: true,
            service: true,
            router: false,
            event: {
                enabled: true,
                type: 'SYNC'
            },
            definition: {
                workflowCode: {
                    type: 'string',
                    required: true,
                    description: 'Required workflow code, which needs to be associated with schema'
                },
                schemaName: {
                    type: 'string',
                    required: true,
                    description: 'Required schema name to auto start workflow for the item'
                },
                moduleName: {
                    type: 'string',
                    required: true,
                    description: 'Required step code, it could be workflow head code or any of the action code'
                },
            },
            indexes: {
                composite: {
                    workflowCode: {
                        enabled: true,
                        name: 'workflowCode',
                        options: {
                            unique: true
                        }
                    },
                    schemaName: {
                        enabled: true,
                        name: 'schemaName',
                        options: {
                            unique: true
                        }
                    }
                }
            }
        }
    }
};