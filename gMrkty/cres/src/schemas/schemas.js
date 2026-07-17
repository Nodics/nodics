/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gMrkty/cres/src/schemas/schemas
 * @description Defines cres schema metadata, model contracts, and generated capability settings.
 * @layer schemas
 * @owner cres
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    cres: {
        reviewTest: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true,
                alias: 'review'
            },
            cache: {
                enabled: false,
                ttl: 10
            },
            search: {
                enabled: false,
                idPropertyName: 'code',
            },
            definition: {
                name: {
                    type: 'string',
                    required: true
                },
                address: {
                    type: 'object',
                    required: true
                },
                'address.city': {
                    type: 'string',
                    required: true
                },
                'address.state': {
                    type: 'string',
                    required: true
                }
            }
        },
    }
};