/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gCore/workflow/flowCore/data/init/headers/user/defaultWorkflowUserHeader
 * @description Provides workflow initializer or sample data consumed by the import layer.
 * @layer data
 * @owner workflow
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    profile: {
        defaultWorkflowEmployee: {
            options: {
                enabled: true,
                schemaName: 'employee',
                operation: 'saveAll', //saveAll, update and saveOrUpdate
                dataFilePrefix: 'defaultWorkflowEmployeeData'
            },
            query: {
                code: '$code',
                loginId: '$loginId',
            },
            macros: {
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
        },
    }
};