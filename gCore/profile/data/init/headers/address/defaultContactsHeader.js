/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gCore/profile/data/init/headers/address/defaultContactsHeader
 * @description Provides profile initializer or sample data consumed by the import layer.
 * @layer data
 * @owner profile
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    profile: {
        defaultContacts: {
            options: {
                enabled: true,
                schemaName: 'contact',
                operation: 'saveAll', //saveAll, update and saveOrUpdate
                tenants: ['default'],
                dataFilePrefix: 'defaultContactsData'
            },
            query: {
                code: '$code'
            }
        },

        defaultTenantContacts: {
            options: {
                enabled: true,
                schemaName: 'contact',
                operation: 'saveAll', //saveAll, update and saveOrUpdate
                dataFilePrefix: 'defaultTenantContactsData'
            },
            query: {
                code: '$code'
            }
        }
    }
};