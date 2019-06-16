/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    profile: {
        defaultTenant: {
            options: {
                enabled: true,
                schemaName: 'tenant', //put type name, if want to push data into search
                operation: 'save', //save, update and saveOrUpdate, put doSave, if data needs to be pushed into serach
                tenants: ['default'],
                dataFilePrefix: 'defaultTenantData'
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