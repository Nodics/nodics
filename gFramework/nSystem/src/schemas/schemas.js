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
            cache: {
                enabled: false
            },
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
                },
            }
        },

        eventListener: {
            super: 'base',
            model: true,
            service: true,
            cache: {
                enabled: false,
                ttl: 3600
            },
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
        }
    }
};