/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nData/nExport/export/src/facade/DataExportFacade
 * @description Coordinates facade-level delegation for nExport data export orchestration operations.
 * @layer facade
 * @owner nExport
 * @override Project modules may override export orchestration through later active modules while preserving nMedia-owned generated-file delivery.
 */
module.exports = {

    /**

     * Executes export behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    export: function (request) {
        return SERVICE.DataExportService.export(request);
    }
};
