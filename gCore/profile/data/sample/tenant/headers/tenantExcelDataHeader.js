/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gCore/profile/data/sample/tenant/headers/tenantExcelDataHeader
 * @description Defines the Profile-owned sample tenant XLSX import header.
 * @layer data
 * @owner profile
 * @override Projects may override this sample data in a later module layer when they own tenant sample-data behavior.
 */
module.exports = {
    profile: {
        defaultTenantExcel: {
            options: {
                enabled: true,
                moduleName: 'profile',
                schemaName: 'tenant',
                operation: 'saveAll',
                tenants: ['default'],
                dataFilePrefix: 'defaultTenantExcelData'
            },
            query: {
                code: '$code'
            }
        }
    }
};
