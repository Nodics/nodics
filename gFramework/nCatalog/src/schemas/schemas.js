/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nCatalog/src/schemas/schemas
 * @description Defines nCatalog schema metadata, model contracts, and generated capability settings.
 * @layer schemas
 * @owner nCatalog
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    catalog: {
        catalog: {
            super: 'base',
            model: true,
            service: {
                enabled: true
            },
            router: {
                enabled: true
            },
            // accessGroups: {
            //     userGroup: 3
            // },
            refSchema: {
                subCatalogs: {
                    enabled: true,
                    schemaName: "catalog",
                    type: 'many',
                    propertyName: 'code'
                }
            },
            definition: {
                subCatalogs: {
                    type: 'array',
                    required: false,
                    description: 'List of sub catalogs if any'
                },
                accessGroups: {
                    default: ['contentUserGroup', 'employeeUserGroup']
                },
            }
        }
    }
};