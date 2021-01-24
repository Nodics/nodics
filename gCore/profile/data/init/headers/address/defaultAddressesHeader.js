/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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