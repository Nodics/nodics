/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module wcms/service/defaultSampleService
 * @description Sample WCMS service scaffold showing the service lifecycle shape for content modules.
 * @layer service
 * @owner wcms
 * @override Project content modules should replace scaffolds with concrete WCMS services in later layers.
 */
module.exports = {
    /**
     * Initializes the sample WCMS service scaffold.
     *
     * @param {Object} options Service loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the sample WCMS service scaffold after loading.
     *
     * @param {Object} options Service loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }
};
