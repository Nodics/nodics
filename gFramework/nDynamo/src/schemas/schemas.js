/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    dynamo: {
        classConfiguration: {
            super: 'base',
            model: true,
            service: true,
            event: {
                enabled: true,
                type: 'SYNC'
            },
            router: false,
            tenants: ['default'],
            definition: {
                type: {
                    enum: [ENUMS.ClassType.SERVICE.key, ENUMS.ClassType.FACADE.key, ENUMS.ClassType.CONTROLLER.key, ENUMS.ClassType.UTILS.key],
                    required: true,
                    description: 'What is type of class [SERVICE, FACADE, CONTROLLER, UTILS]'
                }
            }
        },

        routerConfiguration: {
            super: 'base',
            model: true,
            service: true,
            event: {
                enabled: true,
                type: 'SYNC'
            },
            router: true,
            tenants: ['default'],
            definition: {
                moduleName: {
                    type: 'string',
                    required: true,
                    description: 'Required moduleName'
                },
            }
        },
        pipeline: {
            super: 'base',
            model: true,
            service: true,
            event: {
                enabled: true,
                type: 'SYNC'
            },
            router: true,
            tenants: ['default'],
            definition: {

            }
        },

        schemaConfiguration: {
            super: 'base',
            model: true,
            service: true,
            event: {
                enabled: true,
                type: 'SYNC'
            },
            router: true,
            tenants: ['default'],
            definition: {
                moduleName: {
                    type: 'string',
                    required: true,
                    description: 'Required moduleName'
                },
            }
        }
    }
};