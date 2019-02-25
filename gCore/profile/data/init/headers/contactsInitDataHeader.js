/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    profile: {
        defaultContact: {
            options: {
                schemaName: 'contact',
                operation: 'save', //save, update and saveOrUpdate
                tenant: 'default',
                dataFilePrefix: 'defaultContactData'
            },
            query: {
                code: '$code'
            }
        },

        tenantDefaultContact: {
            options: {
                schemaName: 'contact',
                operation: 'save', //save, update and saveOrUpdate
                //tenant: 'default',
                dataFilePrefix: 'tenantDefaultContactData'
            },
            query: {
                code: '$code'
            }
        }
    }
};