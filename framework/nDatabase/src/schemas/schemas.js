/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    default: {
        super: {
            model: false,
            service: false,
            event: false,
            router: false,
            definition: {
                enterpriseCode: {
                    type: 'string',
                    required: true,
                    description: 'Define enterprise code'
                },
                description: {
                    type: 'string',
                    required: false,
                    description: 'Description of the property'
                },
                created: {
                    type: 'date',
                    required: true,
                    default: 'DefaultPropertyInitialValueProviderService.getCurrentTimestamp',
                    description: 'Timestamp when this item got created in database'
                },
                updated: {
                    type: 'date',
                    required: true,
                    default: 'DefaultPropertyInitialValueProviderService.getCurrentTimestamp',
                    description: 'Timestamp when this item got updated in database'
                }
            },
            options: {
                validationLevel: 'moderate',
                validationAction: 'error'
            }
        },
        base: {
            super: 'super',
            model: false,
            service: false,
            event: false,
            router: false,
            definition: {
                code: {
                    type: 'string',
                    required: true,
                    description: 'To uniquely identify a perticuller item'
                }
            },
            indexes: {
                indexCode: {
                    name: 'code',
                    options: {
                        unique: true
                    }
                }
            }
        },

    }
};