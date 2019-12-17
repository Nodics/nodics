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
            router: true,
            definition: {
                body: {
                    type: 'string',
                    required: true,
                    description: 'Required index name'
                }
            }
        },

        routerConfiguration: {
            super: 'super',
            model: true,
            service: true,
            event: true,
            router: true,
            definition: {
                body: {
                    type: 'string',
                    required: true,
                    description: 'Required index name'
                }
            }
        }
    }
};