/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/profile/data/sample/tenant/headers/tenantCsvDataHeader
 * @description Defines the Profile-owned sample tenant CSV import header.
 * @layer data
 * @owner profile
 * @override Projects may override this sample data in a later module layer when they own tenant sample-data behavior.
 */
module.exports = {
    profile: {
        defaultTenantCsv: {
            options: {
                enabled: true,
                moduleName: 'profile',
                schemaName: 'tenant',
                operation: 'saveAll',
                tenants: ['default'],
                dataFilePrefix: 'defaultTenantCsvData'
            },
            query: {
                code: '$code'
            }
        }
    }
};
