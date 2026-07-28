/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
                enabled: true,
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
