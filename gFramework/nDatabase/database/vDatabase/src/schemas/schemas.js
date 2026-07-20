/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nDatabase/database/vDatabase/src/schemas/schemas
 * @description Defines nDatabase schema metadata, model contracts, and generated capability settings.
 * @layer schemas
 * @owner nDatabase
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    default: {
        versioned: {
            super: 'base',
            model: false,
            service: {
                enabled: false
            },
            router: {
                enabled: false
            },
            versioned: true,
            definition: {
                versionId: {
                    type: 'int',
                    required: true,
                    description: 'Incremented verison id for staged items'
                }
            },
            indexes: {
                common: {
                    versionId: {
                        name: 'versionId',
                        enabled: true,
                        options: {
                            unique: true
                        }
                    }
                }
            }
        }
    }
};
