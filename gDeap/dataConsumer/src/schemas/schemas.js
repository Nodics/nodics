/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gDeap/dataConsumer/src/schemas/schemas
 * @description Defines dataConsumer schema metadata, model contracts, and generated capability settings.
 * @layer schemas
 * @owner dataConsumer
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    dataConsumer: {
        internalData: {
            super: 'super',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
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
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
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