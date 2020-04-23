/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    catalog: {
        catalog: {
            super: 'base',
            model: true,
            service: true,
            router: true,
            accessGroups: {
                employeeUserGroup: 3
            },
            refSchema: {
                superCatalog: {
                    schemaName: "catalog",
                    type: 'many',
                    propertyName: 'code'
                }
            },
            definition: {
                superCatalog: {
                    type: 'array',
                    required: false,
                    description: 'List of sub catalogs if any'
                },
                userGroups: {
                    type: 'array',
                    required: true,
                    default: ['contentUserGroup', 'employeeUserGroup'],
                    description: 'User group code for which this user belongs'
                },
            }
        }
    }
};