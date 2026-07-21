/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module inventory/facade/DefaultStockTransferIntentFacade @description Delegates internal transfer commands. @layer facade @owner inventory */
module.exports = { /** Initializes facade. */ init: function () { return Promise.resolve(true); }, /** Completes initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Delegates create. */ create: r => SERVICE.DefaultStockTransferIntentService.create(r), /** Delegates dispatch. */ dispatch: r => SERVICE.DefaultStockTransferIntentService.dispatch(r),
    /** Delegates receive. */ receive: r => SERVICE.DefaultStockTransferIntentService.receive(r), /** Delegates cancel. */ cancel: r => SERVICE.DefaultStockTransferIntentService.cancel(r),
    /** Delegates discrepancy. */ discrepancy: r => SERVICE.DefaultStockTransferIntentService.discrepancy(r), /** Delegates reconcile. */ reconcile: r => SERVICE.DefaultStockTransferIntentService.reconcile(r),
    /** Delegates return. */ returnTransfer: r => SERVICE.DefaultStockTransferIntentService.returnTransfer(r) };
