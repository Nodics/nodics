/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module product @description Lifecycle entrypoint for the Product capability. @layer module @owner product */
module.exports = {
    /** Initializes Product. */ init: function () { return Promise.resolve(true); },
    /** Completes Product initialization. */ postInit: function () { return Promise.resolve(true); }
};
