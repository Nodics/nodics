/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    validator: {
        validator: {
            super: 'base',
            model: true,
            service: true,
            cache: {
                enabled: true,
                ttl: 3600
            },
            event: false,
            router: true,
            definition: {
                type: {
                    type: 'string',
                    required: true,
                    description: 'Type could any value of ValidatorType enum'
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
                active: {
                    type: 'string',
                    required: true,
                    description: 'Mandate whether this needs to be applied'
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