/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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