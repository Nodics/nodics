/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module pricing/controller/DefaultPricingManagementController @description Maps human BackOffice intents to bounded Pricing management operations. @layer controller @owner pricing */
module.exports = {
    /** Initializes the controller. */ init: function () { return Promise.resolve(true); },
    /** Completes initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Delegates an operation while preserving the framework request contract. */ invoke: function (operation, request, callback) { let promise = SERVICE.DefaultPricingManagementService[operation](request).then(data => ({ code: 'SUC_PRICE_00001', data: data })); return callback ? promise.then(value => callback(null, value)).catch(callback) : promise; },
    /** Lists a bounded resource projection. */ list: function (request, callback) { return this.invoke('list', request, callback); },
    /** Gets one resource by business identity. */ get: function (request, callback) { return this.invoke('get', request, callback); },
    /** Creates a governed Pricing record. */ create: function (request, callback) { return this.invoke('create', request, callback); },
    /** Updates a governed Pricing record. */ update: function (request, callback) { return this.invoke('update', request, callback); },
    /** Retires a governed Pricing record. */ retire: function (request, callback) { return this.invoke('retire', request, callback); },
    /** Validates without persistence. */ validate: function (request, callback) { return this.invoke('validate', request, callback); },
    /** Finds deterministic overlap risks. */ conflicts: function (request, callback) { return this.invoke('conflicts', request, callback); },
    /** Simulates resolution without persistence or cache. */ simulate: function (request, callback) { return this.invoke('simulate', request, callback); },
    /** Submits a Price List release to configured Workflow governance. */ submitPublication: function (request, callback) { return this.invoke('submitPublication', request, callback); }
};
