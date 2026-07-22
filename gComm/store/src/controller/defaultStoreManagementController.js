/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module store/controller/DefaultStoreManagementController @description Maps human Store management routes to bounded intent operations. @layer controller @owner store @override Later modules may decorate response mapping while preserving the management service's security boundary. */
module.exports = { /** Initializes the controller. */ init: function () { return Promise.resolve(true); }, /** Completes initialization. */ postInit: function () { return Promise.resolve(true); }, /** Invokes one operation. */ invoke: function (operation, request, callback) { let promise = SERVICE.DefaultStoreManagementService[operation](request).then(data => ({ code: 'SUC_STORE_00001', data: data })); return callback ? promise.then(value => callback(null, value)).catch(callback) : promise; }, /** Lists Store resources. */ list: function (request, callback) { return this.invoke('list', request, callback); }, /** Gets one Store resource. */ get: function (request, callback) { return this.invoke('get', request, callback); }, /** Creates a Store resource. */ create: function (request, callback) { return this.invoke('create', request, callback); }, /** Updates a Store resource. */ update: function (request, callback) { return this.invoke('update', request, callback); }, /** Retires a Store resource. */ retire: function (request, callback) { return this.invoke('retire', request, callback); } };
