/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nData/nExport/export/config/properties
 * @description Defines default nExport configuration used during module startup and layering.
 * @layer config
 * @owner nExport
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    dataExport: {
        enabled: true,
        allowedFormats: ['csv', 'json'],
        defaultFormat: 'csv',
        maximumRecords: 1000,
        pageSize: 50,
        media: {
            folderCode: 'exportFiles',
            formatCode: 'exportFile'
        }
    }
};
