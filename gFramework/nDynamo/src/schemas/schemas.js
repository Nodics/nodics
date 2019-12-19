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
            super: 'super',
            model: true,
            service: true,
            event: true,
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
            super: 'super',
            model: true,
            service: true,
            event: true,
            router: true,
            tenants: ['default'],
            definition: {
                body: {
                    type: 'object',
                    required: true,
                    description: 'Required index name'
                }
            }
        }
    }
};