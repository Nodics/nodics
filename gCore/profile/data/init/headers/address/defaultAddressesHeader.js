/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/profile/data/init/headers/address/defaultAddressesHeader
 * @description Provides profile initializer or sample data consumed by the import layer.
 * @layer data
 * @owner profile
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    profile: {
        defaultAddresses: {
            options: {
                enabled: true,
                schemaName: 'address',
                operation: 'saveAll', //save, update and saveOrUpdate
                tenants: ['default'],
                dataFilePrefix: 'defaultAddressesData'
            },
            query: {
                code: '$code'
            }
        },

        defaultTenantAddresses: {
            options: {
                enabled: true,
                schemaName: 'address',
                operation: 'saveAll', //save, update and saveOrUpdate
                dataFilePrefix: 'defaultTenantAddressesData'
            },
            query: {
                code: '$code'
            }
        }
    }
};