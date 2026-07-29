/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
