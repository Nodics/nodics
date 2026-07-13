/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module dataPublisher/service/defaultSampleService
 * @description Sample service scaffold for DEAP data publishing capabilities.
 * @layer service
 * @owner dataPublisher
 * @override Project DEAP modules should replace scaffolds with concrete publishing services.
 */
module.exports = {
    /**
     * Initializes the sample data publisher service scaffold.
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
     * Finalizes the sample data publisher service scaffold after loading.
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
