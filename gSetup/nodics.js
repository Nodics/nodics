/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/*
    Nodics - Enterprise Micro-Services Management Framework

    gSetup is intentionally module-shaped for repository consistency, but it is
    excluded from runtime module loading by package metadata.
 */

/**
 * @module gSetup/nodics
 * @description Registers the gSetup module lifecycle hooks and module-level startup behavior.
 * @layer module
 * @owner gSetup
 * @override Projects may override lifecycle behavior through later active modules instead of modifying this module directly.
 */
module.exports = {
    /**
     * Initializes  behavior for the module runtime.
     *
     * @returns {*} Method result.
     */
    init: function () {
        return Promise.resolve(true);
    },

    /**

     * Runs post-initialization behavior after the module runtime is available.

     *

     * @returns {*} Method result.

     */

    postInit: function () {
        return Promise.resolve(true);
    }
};
