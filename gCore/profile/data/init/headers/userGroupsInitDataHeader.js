/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    profile: {
        defaultUserGroup: {
            options: {
                enabled: true,
                schemaName: 'userGroup',
                operation: 'save', //save, update and saveOrUpdate
                dataFilePrefix: 'defaultUserGroupData'
            },
            query: {
                code: '$code'
            }
        }
    }
};