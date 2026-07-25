/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module profile/controller/enterprise/DefaultEnterpriseManagementController
 * @description Maps permissioned employee enterprise-search requests to the Profile facade.
 * @layer controller
 * @owner profile
 * @override Later modules may replace response mapping while preserving the Profile-owned projection and authorization boundary.
 */
module.exports = {
    /** Searches enterprises through the bounded management facade. */
    search: function (request, callback) {
        request.query = request.httpRequest && request.httpRequest.query || request.query || {};
        let promise = FACADE.DefaultEnterpriseManagementFacade.search(request)
            .then(data => ({ code: 'SUC_PRFL_00000', data: data }));
        return callback ? promise.then(value => callback(null, value)).catch(callback) : promise;
    },
    /** Creates one enterprise through the Profile-owned management facade. */
    create: function (request, callback) {
        request.body = request.httpRequest && request.httpRequest.body || request.body || {};
        let promise = FACADE.DefaultEnterpriseManagementFacade.create(request)
            .then(data => ({ code: 'SUC_PRFL_00000', data: data }));
        return callback ? promise.then(value => callback(null, value)).catch(callback) : promise;
    }
};
