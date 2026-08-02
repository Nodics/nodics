/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module startio/envs/startioLocal/data/init/headers/enterprise/startioLocalTestTenantsHeader
 * @description Provides envs initializer or sample data consumed by the import layer.
 * @layer data
 * @owner envs
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    profile: {
        startioLocalTestTenants: {
            options: {
                enabled: true,
                schemaName: 'tenant',
                operation: 'saveAll',
                tenants: ['default'],
                dataFilePrefix: 'startioLocalTestTenantsData',
                owningModule: 'startioLocal'
            },
            query: {
                code: '$code'
            }
        }
    }
};
