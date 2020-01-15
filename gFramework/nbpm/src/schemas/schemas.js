/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    bpm: {
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
                    description: 'Required step code, it could be workflow head code or any of the action code'
                },
                schemaName: {
                    type: 'string',
                    required: true,
                    description: 'Required step code, it could be workflow head code or any of the action code'
                },
                moduleName: {
                    type: 'string',
                    required: true,
                    description: 'Required step code, it could be workflow head code or any of the action code'
                },
            }
        }
    }
};