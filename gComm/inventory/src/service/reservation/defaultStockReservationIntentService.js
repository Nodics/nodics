/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module inventory/service/reservation/DefaultStockReservationIntentService @description Secures module and CronJob reservation commands. @layer service @owner inventory */
module.exports = {
    /** Initializes reservation intents. */ init: function () { return Promise.resolve(true); },
    /** Completes reservation intent initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Rejects human access to machine reservation commands. */
    authorize: function (request) {
        if (((CONFIG.get('inventory') || {}).stockReservation || {}).requireServiceToken !== false &&
            (!request.authData || request.authData.tokenType !== 'service')) throw new CLASSES.NodicsError('ERR_INV_00037', 'Stock reservation requires an internal service identity');
    },
    /** Creates one reservation. */ reserve: async function (request) { this.authorize(request); return { code: 'SUC_INV_00004',
        data: await SERVICE.DefaultStockReservationOrchestrationService.reserve(Object.assign({}, request, { reservation: request.body || {} })) }; },
    /** Releases one reservation. */ release: async function (request) { this.authorize(request); return { code: 'SUC_INV_00004',
        data: await SERVICE.DefaultStockReservationOrchestrationService.release(Object.assign({}, request, { reservation: request.body || {} }), 'RELEASED') }; },
    /** Cancels one reservation. */ cancel: async function (request) { this.authorize(request); return { code: 'SUC_INV_00004',
        data: await SERVICE.DefaultStockReservationOrchestrationService.cancel(Object.assign({}, request, { reservation: request.body || {} })) }; },
    /** Marks one reservation consumed pending its governed ISSUE movement. */ consume: async function (request) { this.authorize(request); return { code: 'SUC_INV_00004',
        data: await SERVICE.DefaultStockReservationOrchestrationService.consume(Object.assign({}, request, { reservation: request.body || {} })) }; },
    /** Expires elapsed reservations for CronJob invocation. */ expire: async function (request) { this.authorize(request); return { code: 'SUC_INV_00004',
        data: await SERVICE.DefaultStockReservationOrchestrationService.expire(Object.assign({}, request, { at: request.body && request.body.at })) }; }
};
