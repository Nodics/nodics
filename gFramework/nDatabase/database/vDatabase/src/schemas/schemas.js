/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
