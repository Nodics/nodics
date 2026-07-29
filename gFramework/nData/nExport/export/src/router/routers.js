/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nData/nExport/export/src/router/routers
 * @description Publishes export orchestration routes owned by nExport. Generated-file delivery remains owned by nMedia.
 * @layer router
 * @owner nExport
 * @override Project modules may add export orchestration routes through later active modules only when they do not duplicate nMedia media delivery or download authority.
 */
module.exports = {
    export: {
        dataExport: {
            exportPost: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'export.run',
                apiExposure: 'dataExport',
                key: '/export',
                method: 'POST',
                controller: 'DataExportController',
                operation: 'export',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; nExport creates governed export media and nMedia owns file download.',
                    method: 'POST',
                    url: 'http://host:port/nodics/export/v0/export',
                    body: {
                        enterpriseCode: 'Business enterprise context for export authorization and target media placement',
                        tenantCode: 'Optional backend-resolved tenant context when explicitly narrowed by the caller',
                        moduleName: 'Owning module of the schema/model being exported',
                        schemaName: 'Schema/model to export',
                        format: 'Output file format such as csv or json',
                        query: 'Schema workbench query used to select records'
                    }
                }
            }
        }
    }
};
