/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module inventory/service/transfer/DefaultStockTransferIntentService @description Secures module-to-module Stock Transfer commands. @layer service @owner inventory */
module.exports = {
    /** Initializes intents. */ init: function () { return Promise.resolve(true); }, /** Completes initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Enforces service identity. */ authorize: function (request) { if (((CONFIG.get('inventory') || {}).stockTransfer || {}).requireServiceToken !== false && (!request.authData || request.authData.tokenType !== 'service')) throw new CLASSES.NodicsError('ERR_INV_00047', 'Stock transfer requires an internal service identity'); },
    /** Delegates a secured operation. */ execute: async function (request, operation) { this.authorize(request); return { code: 'SUC_INV_00006', data: await SERVICE.DefaultStockTransferOrchestrationService[operation](Object.assign({}, request, { transfer: request.body || {} })) }; },
    /** Creates transfer. */ create: function (request) { return this.execute(request, 'create'); }, /** Dispatches transfer. */ dispatch: function (request) { return this.execute(request, 'dispatch'); },
    /** Receives transfer. */ receive: function (request) { return this.execute(request, 'receive'); }, /** Cancels transfer. */ cancel: function (request) { return this.execute(request, 'cancel'); },
    /** Records discrepancy. */ discrepancy: function (request) { return this.execute(request, 'discrepancy'); }, /** Reconciles transfer. */ reconcile: function (request) { return this.execute(request, 'reconcile'); },
    /** Creates reverse return. */ returnTransfer: function (request) { return this.execute(request, 'returnTransfer'); }
};
