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
                active: {
                    type: 'bool',
                    required: true,
                    description: 'Flag to check if tenant is still active',
                    searchOptions: {
                        enabled: true, // default is false
                    }
                },
                description: {
                    type: 'string',
                    required: false,
                    description: 'Description of the property',
                    searchOptions: {
                        enabled: true, // default is false
                    }
                },
                created: {
                    type: 'date',
                    required: true,
                    default: 'DefaultPropertyInitialValueProviderService.getCurrentTimestamp',
                    description: 'Timestamp when this item got created in database',
                    searchOptions: {
                        enabled: true, // default is false
                    }
                },
                updated: {
                    type: 'date',
                    required: true,
                    default: 'DefaultPropertyInitialValueProviderService.getCurrentTimestamp',
                    description: 'Timestamp when this item got updated in database',
                    searchOptions: {
                        enabled: true, // default is false
                    }
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
                    primary: true,
                    description: 'To uniquely identify a perticuller item',
                    searchOptions: {
                        enabled: true, // default is false
                    }
                }
            },
            indexes: {
                common: {

                },
                composite: {

                },
                individual: {
                    // indexCode: {
                    //     name: 'code',
                    //     enabled: true,
                    //     options: {
                    //         unique: true
                    //     }
                    // }
                }
            }
        }
    }
};