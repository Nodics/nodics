/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module inventory/service/reconciliation/DefaultStockReconciliationInternalClientService @description Crosses from a human workflow request to the service-token-only Inventory repair command. @layer service @owner inventory */
module.exports = {
    /** Initializes the client. */ init: function () { return Promise.resolve(true); },
    /** Completes initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Calls the existing internal repair API with a runtime-bound module token. */
    repair: function (request) { let token = NODICS.getInternalAuthToken(request.tenant); if (!token) throw new CLASSES.NodicsError('ERR_INV_00051', 'Inventory repair service token is unavailable'); let descriptor = SERVICE.DefaultModuleService.buildRequest({ moduleName: 'inventory', apiName: '/internal/stock-reconciliation/repair', methodName: 'POST', header: { Authorization: 'Bearer ' + token }, requestBody: request.reconciliation, idempotencyKey: request.reconciliation.workflowCarrierCode }); return SERVICE.DefaultModuleService.fetch(descriptor); }
};
