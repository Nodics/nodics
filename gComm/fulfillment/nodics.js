/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module fulfillment @description Lifecycle entrypoint for the Fulfillment capability. @layer module @owner fulfillment */
module.exports = {
    /** Executes the init Fulfillment contract. */
    init: function () { return Promise.resolve(true); },
    /** Executes the postInit Fulfillment contract. */
    postInit: function () { return Promise.resolve(true); },
};
