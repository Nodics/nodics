/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module product/controller/DefaultProductManagementController @description Maps human Product management routes to bounded intent operations. @layer controller @owner product */
module.exports = {
    /** Initializes the controller. */ init: function () { return Promise.resolve(true); },
    /** Completes controller initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Invokes a management operation using the framework callback contract. */ invoke: function (operation, request, callback) { let promise = SERVICE.DefaultProductManagementService[operation](request).then(data => ({ code: 'SUC_PRODUCT_00001', data: data })); return callback ? promise.then(value => callback(null, value)).catch(callback) : promise; },
    /** Lists Product resources. */ list: function (request, callback) { return this.invoke('list', request, callback); },
    /** Gets one Product resource. */ get: function (request, callback) { return this.invoke('get', request, callback); },
    /** Creates a Product resource. */ create: function (request, callback) { return this.invoke('create', request, callback); },
    /** Updates a Product resource. */ update: function (request, callback) { return this.invoke('update', request, callback); },
    /** Retires a Product resource. */ retire: function (request, callback) { return this.invoke('retire', request, callback); },
    /** Submits a Product release to Workflow governance. */ submitPublication: function (request, callback) { return this.invoke('submitPublication', request, callback); }
};
