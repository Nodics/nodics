/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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