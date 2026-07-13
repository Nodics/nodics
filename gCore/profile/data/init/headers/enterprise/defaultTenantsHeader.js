/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/profile/data/init/headers/enterprise/defaultTenantsHeader
 * @description Provides profile initializer or sample data consumed by the import layer.
 * @layer data
 * @owner profile
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    profile: {
        defaultTenants: {
            options: {
                enabled: true,
                schemaName: 'tenant', //put type name, if want to push data into search
                operation: 'saveAll', //saveAll, update and saveOrUpdate, put doSave, if data needs to be pushed into serach
                tenants: ['default'],
                dataFilePrefix: 'defaultTenantsData'
            },
            query: {
                //addresses.code: '$code'
                code: '$code',
                /*jobDetail.name: '$name'
                name: 'Himkar Dwivedi'*/
            }
        },
    }
};