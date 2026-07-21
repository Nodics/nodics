/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module product/controller/DefaultProductPublicationTargetController @description Maps service-token-only Online Product deployment operations. @layer controller @owner product */
module.exports = {
    /** Initializes the target controller. */ init: function () { return Promise.resolve(true); },
    /** Completes target-controller initialization. */ postInit: function () { return Promise.resolve(true); },
    /** Invokes one Product target operation. */ invoke: function (operation, request, callback) { let promise = SERVICE.DefaultProductPublicationTargetService[operation](request); return callback ? promise.then(value => callback(null, { code: 'SUC_PRODUCT_00001', data: value })).catch(callback) : promise; },
    /** Deploys a Product manifest. */ deploy: function (request, callback) { return this.invoke('deploy', request, callback); },
    /** Returns the active Product release. */ status: function (request, callback) { return this.invoke('getStatus', request, callback); },
    /** Rolls Product back to an accepted Online manifest. */ rollback: function (request, callback) { return this.invoke('rollback', request, callback); }
};
