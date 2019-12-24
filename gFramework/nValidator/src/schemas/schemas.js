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
            router: true,
            definition: {
                type: {
                    enum: [ENUMS.ValidatorType.schema.key, ENUMS.ValidatorType.import.key, ENUMS.ValidatorType.export.key, ENUMS.ValidatorType.search.key, ENUMS.ValidatorType.workflow.key, ENUMS.ValidatorType.job.key],
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