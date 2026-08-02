/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gCore/profile/data/init/headers/enterprise/defaultEnterpriseHeader
 * @description Provides profile initializer or sample data consumed by the import layer.
 * @layer data
 * @owner profile
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    profile: {
        defaultEnterprise: {
            options: {
                enabled: true,
                schemaName: 'enterprise',
                operation: 'saveAll', //saveAll, update and saveOrUpdate
                tenants: ['default'],
                dataFilePrefix: 'defaultEnterpriseData'
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
                            index: 0,
                        },
                        active: {
                            type: 'bool',
                            index: 1
                        }
                    }
                },
                addresses: {
                    options: {
                        model: 'address',
                        returnProperty: 'code'
                    },
                    rule: {
                        code: {
                            type: 'string',
                            index: 0
                        }
                    }
                },
                contacts: {
                    options: {
                        model: 'contact',
                        returnProperty: 'code'
                    },
                    rule: {
                        code: {
                            type: 'string',
                            index: 0
                        }
                    }
                }
            }
        }
    }
};