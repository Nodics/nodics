/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gCore/profile/data/sample/tenant/headers/tenantLegacyExcelDataHeader
 * @description Preserves the Profile-owned historical tenant legacy XLS import header as sample reference data.
 * @layer data
 * @owner profile
 * @override Promote this reference to active validation only after the legacy binary XLS parser contract is verified.
 */
module.exports = {
    profile: {
        defaultTenantLegacyExcel: {
            options: {
                enabled: false,
                moduleName: 'profile',
                schemaName: 'tenant',
                operation: 'saveAll',
                tenants: ['default'],
                dataFilePrefix: 'defaultTenantLegacyExcelData'
            },
            query: {
                code: '$code'
            }
        }
    }
};
