/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module profile/facade/enterprise/DefaultEnterpriseManagementFacade
 * @description Provides the replaceable Profile facade boundary for enterprise management reads.
 * @layer facade
 * @owner profile
 * @override Later modules may compose additional policy while delegating persistence and projection to Profile services.
 */
module.exports = {
    /** Delegates bounded enterprise search to the authoritative Profile service. */
    search: function (request) {
        return SERVICE.DefaultEnterpriseManagementService.search(request);
    },
    /** Delegates confirmed enterprise creation to the authoritative Profile service. */
    create: function (request) {
        return SERVICE.DefaultEnterpriseManagementService.create(request);
    }
};
