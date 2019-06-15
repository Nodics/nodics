/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    profile: {
        defaultAddress: {
            options: {
                enabled: true,
                schemaName: 'address',
                operation: 'save', //save, update and saveOrUpdate
                tenants: ['default'],
                dataFilePrefix: 'defaultAddressData'
            },
            query: {
                code: '$code'
            }
        },

        tenantDefaultAddresses: {
            options: {
                enabled: true,
                schemaName: 'address',
                operation: 'save', //save, update and saveOrUpdate
                dataFilePrefix: 'tenantDefaultAddressesData'
            },
            query: {
                code: '$code'
            }
        }
    }
};