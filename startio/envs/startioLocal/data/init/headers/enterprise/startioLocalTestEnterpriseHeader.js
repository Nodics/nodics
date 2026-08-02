/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module startio/envs/startioLocal/data/init/headers/enterprise/startioLocalTestEnterpriseHeader
 * @description Provides envs initializer or sample data consumed by the import layer.
 * @layer data
 * @owner envs
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    profile: {
        startioLocalTestEnterprise: {
            options: {
                enabled: true,
                schemaName: 'enterprise',
                operation: 'saveAll',
                tenants: ['default'],
                dataFilePrefix: 'startioLocalTestEnterpriseData',
                owningModule: 'startioLocal'
            },
            query: {
                code: '$code'
            },
            macros: {
                tenant: {
                    options: {
                        model: 'tenant',
                        returnProperty: 'code'
                    },
                    rule: {
                        code: {
                            type: 'string',
                            index: 0
                        },
                        active: {
                            type: 'bool',
                            index: 1
                        }
                    }
                }
            }
        }
    }
};
