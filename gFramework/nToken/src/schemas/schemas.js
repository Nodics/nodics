/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nToken/src/schemas/schemas
 * @description Defines nToken schema metadata, model contracts, and generated capability settings.
 * @layer schemas
 * @owner nToken
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    token: {
        token: {
            super: 'super',
            model: true,
            service: {
                enabled: true
            },
            cache: {
                enabled: false,
                ttl: 1000
            },
            router: {
                enabled: false,
            },
            definition: {
                key: {
                    type: 'string',
                    required: true,
                    description: 'Primey key for the generated Token'
                },
                ops: {
                    type: 'string',
                    required: true,
                    description: 'Operation name for that Token been generated'
                },
                value: {
                    type: 'string',
                    required: true,
                    description: 'Generated token value',
                    default: 'DefaultTokenHandlerService.generateToken',
                },
                expireAt: {
                    type: 'date',
                    required: true,
                    default: 'DefaultTokenHandlerService.generateExpiry',
                    description: 'Token expiration timestamp',
                    searchOptions: {
                        enabled: true, // default is false
                    }
                },
                type: {
                    enum: [ENUMS.TokenType.OTP.key, ENUMS.TokenType.ORDER.key],
                    required: true,
                    description: 'Required value could be only in [OTP, ORDER]'
                },
            }
        },
    }
};