/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module inventory/service/allocation/DefaultStockAllocationIntentService @description Secures Order-to-Inventory allocation commands. @layer service @owner inventory */
module.exports = {
    /** Initializes allocation intents. */ init: function () { return Promise.resolve(true); },
    /** Completes intent initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Enforces module identity. */ authorize: function (request) { if (((CONFIG.get('inventory') || {}).stockAllocation || {}).requireServiceToken !== false &&
        (!request.authData || request.authData.tokenType !== 'service')) throw new CLASSES.NodicsError('ERR_INV_00042', 'Stock allocation requires an internal service identity'); },
    /** Allocates reservations to demand. */ allocate: async function (request) { this.authorize(request); return { code: 'SUC_INV_00005', data: await SERVICE.DefaultStockAllocationOrchestrationService.allocate(Object.assign({}, request, { allocation: request.body || {} })) }; },
    /** Cancels allocation and holds. */ cancel: async function (request) { this.authorize(request); return { code: 'SUC_INV_00005', data: await SERVICE.DefaultStockAllocationOrchestrationService.close(Object.assign({}, request, { allocation: request.body || {} }), 'CANCELLED') }; },
    /** Releases allocation and holds. */ release: async function (request) { this.authorize(request); return { code: 'SUC_INV_00005', data: await SERVICE.DefaultStockAllocationOrchestrationService.close(Object.assign({}, request, { allocation: request.body || {} }), 'RELEASED') }; },
    /** Reconciles fulfillment evidence. */ fulfill: async function (request) { this.authorize(request); return { code: 'SUC_INV_00005', data: await SERVICE.DefaultStockAllocationOrchestrationService.fulfill(Object.assign({}, request, { allocation: request.body || {} })) }; }
};
