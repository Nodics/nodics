/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module inventory/controller/DefaultInventoryOperationsController @description Maps secured BackOffice operational reads to safe Inventory projections. @layer controller @owner inventory */
module.exports = { /** Initializes controller. */ init: function () { return Promise.resolve(true); }, /** Completes initialization. */ postInit: function () { return Promise.resolve(true); }, /** Lists requested resource. */ list: function (resource, request, callback) { let promise = SERVICE.DefaultInventoryOperationsService.list(resource, request).then(data => ({ code: 'SUC_INV_00003', data })); return callback ? promise.then(value => callback(null, value)).catch(callback) : promise; }, /** Lists Balances. */ balances: function (r, c) { return module.exports.list('balances', r, c); }, /** Lists Movements. */ movements: function (r, c) { return module.exports.list('movements', r, c); }, /** Lists Reservations. */ reservations: function (r, c) { return module.exports.list('reservations', r, c); }, /** Lists Allocations. */ allocations: function (r, c) { return module.exports.list('allocations', r, c); }, /** Lists Transfers. */ transfers: function (r, c) { return module.exports.list('transfers', r, c); }, /** Lists findings. */ findings: function (r, c) { return module.exports.list('findings', r, c); } };
