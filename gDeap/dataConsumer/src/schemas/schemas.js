/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    dataConsumer: {
        internalData: {
            super: 'super',
            model: true,
            service: true,
            event: false,
            router: true,
            cache: {
                enabled: true,
                ttl: 10
            },
            search: {
                enabled: true,
                idPropertyName: 'code',
            },
            definition: {
                active: {
                    required: false,
                },
                tenant: {
                    type: 'string',
                    required: true,
                    description: 'Mandate tenant code',
                    searchOptions: {
                        enabled: true,
                    }
                }
            }
        },
        externalData: {
            super: 'super',
            model: true,
            service: true,
            event: false,
            router: true,
            cache: {
                enabled: true,
                ttl: 10
            },
            search: {
                enabled: true,
                idPropertyName: 'code',
            },
            definition: {
                active: {
                    required: false,
                },
                tenant: {
                    type: 'string',
                    required: true,
                    description: 'Mandate tenant code',
                    searchOptions: {
                        enabled: true,
                    }
                }
            }
        }
    }
};