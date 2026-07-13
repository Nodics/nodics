/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cronjob/module/nodics
 * @description Cronjob module lifecycle entrypoint for scheduler, route, pipeline, and node-responsibility capabilities.
 * @layer module
 * @owner cronjob
 * @override Project modules may add later lifecycle hooks for customer-specific cronjob behavior.
 */
module.exports = {
    /**
     * Initializes cronjob during module loading.
     *
     * @param {Object} options Module loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes cronjob after module artifacts have loaded.
     *
     * @param {Object} options Module loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
            // this.LOG.debug('Collecting Job interceptors definitions');
            // SERVICE.DefaultCronJobConfigurationService.prepareJobInterceptors().then(done => {
            //     SERVICE.DefaultCronJobConfigurationService.prepareJobValidators().then(done => {
            //         resolve(true);
            //     }).catch(error => {
            //         reject(error);
            //     });
            // }).catch(error => {
            //     reject(error);
            // });
        });
    }
};
