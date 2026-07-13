/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module mongodb/vMongodb/service/DefaultSampleService
 * @description Versioned MongoDB sample service placeholder used as an
 * extension template for database-specific project behavior.
 * @layer service
 * @owner nDatabase
 * @override Project modules may replace this sample with real versioned MongoDB
 * behavior without changing Nodics framework modules.
 */
module.exports = {
    /**
     * Initializes the sample versioned MongoDB service.
     *
     * @param {Object} options Startup options supplied by the module initializer.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the sample versioned MongoDB service.
     *
     * @param {Object} options Startup options supplied by the module initializer.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }
};
