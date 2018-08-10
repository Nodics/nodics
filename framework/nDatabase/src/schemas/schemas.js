/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    default: {
        init: {
            definition: {
                code: {
                    type: 'string',
                    required: true
                },
                created: {
                    type: 'date',
                    required: true,
                    default: 'DefaultPropertyInitialValueProviderService.getCurrentTimestamp'
                },
                updated: {
                    type: 'date',
                    required: true,
                    default: 'DefaultPropertyInitialValueProviderService.getCurrentTimestamp'
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
        base: {
            super: 'init',
            definition: {
                enterpriseCode: {
                    type: 'string',
                    required: true
                }
            },
            indexes: {
                indexEnterpriseCode: {
                    name: 'enterpriseCode',
                    options: {
                        unique: true
                    }
                }
            },
            options: {
                validationLevel: 'moderate',
                validationAction: 'error'
            }
        },

    }
};