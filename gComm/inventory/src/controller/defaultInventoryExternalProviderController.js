/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/** @module inventory/controller/DefaultInventoryExternalProviderController @description Maps internal provider commands to configured module transport. @layer controller @owner inventory */
module.exports = { /** Initializes controller. */ init: function () { return Promise.resolve(true); }, /** Completes initialization. */ postInit: function () { return Promise.resolve(true); }, /** Invokes provider. */ invoke: function (request, callback) { let promise = SERVICE.DefaultInventoryExternalProviderService.invoke(Object.assign({}, request, { provider: request.body || {} })).then(data => ({ code: 'SUC_INV_00007', data })); return callback ? promise.then(value => callback(null, value)).catch(callback) : promise; } };
