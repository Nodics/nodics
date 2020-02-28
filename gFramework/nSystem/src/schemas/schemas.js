/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    system: {
        configuration: {
            super: 'base',
            model: true,
            service: true,
            event: {
                enabled: true,
                type: 'SYNC'
            },
            router: true,
            definition: {
                config: {
                    type: 'string',
                    required: false,
                    description: 'Mandate configuration'
                }
            }
        },

        eventListener: {
            super: 'base',
            model: true,
            service: true,
            event: {
                enabled: true,
                type: 'SYNC'
            },
            tenants: ['default'],
            router: true,
            definition: {
                event: {
                    type: 'string',
                    required: false,
                    description: 'Mandate event name'
                },
                listener: {
                    type: 'string',
                    required: true,
                    description: 'Mandate listener handler'
                },
                moduleName: {
                    type: 'string',
                    required: true,
                    description: 'Mandate moduleName, could be common as well'
                }
            }
        },

        interceptor: {
            super: 'base',
            model: true,
            service: true,
            event: {
                enabled: true,
                type: 'SYNC'
            },
            tenants: ['default'],
            router: true,
            definition: {
                type: {
                    enum: [ENUMS.InterceptorType.schema.key, ENUMS.InterceptorType.import.key, ENUMS.InterceptorType.export.key, ENUMS.InterceptorType.search.key, ENUMS.InterceptorType.workflow.key, ENUMS.InterceptorType.job.key],
                    required: true,
                    description: 'Required value could be only in [schema, import, export, search, workflow, job]'
                },
                item: {
                    type: 'string',
                    required: false,
                    description: 'For which item it belongs, if blank, will be applied for all validators'
                },
                trigger: {
                    type: 'string',
                    required: true,
                    description: 'Mandate trigger name like, preSave, postSave'
                },
                index: {
                    type: 'int',
                    required: true,
                    description: 'Mandate sequence where it needs to be applied'
                },
                handler: {
                    type: 'string',
                    required: false,
                    description: 'If business logic is defined in service class'
                },
                script: {
                    type: 'string',
                    required: false,
                    description: 'Define execution script to be evaluated'
                }
            }
        }
    }
};