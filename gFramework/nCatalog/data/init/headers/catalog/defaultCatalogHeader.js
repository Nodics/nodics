/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nCatalog/data/init/headers/catalog/defaultCatalogHeader
 * @description Provides nCatalog initializer or sample data consumed by the import layer.
 * @layer data
 * @owner nCatalog
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    catalog: {
        defaultCatalogData: {
            options: {
                enabled: true,
                schemaName: 'catalog',
                operation: 'saveAll',
                dataFilePrefix: 'defaultCatalogData',
                userGroups: ['employeeUserGroup'],
                finalizeData: false
            },
            query: {
                code: '$code'
            }
        }
    }
};