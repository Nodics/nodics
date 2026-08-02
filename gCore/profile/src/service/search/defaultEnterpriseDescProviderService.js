/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gCore/profile/src/service/search/defaultEnterpriseDescProviderService
 * @description Implements profile default enterprise desc provider service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /**
     * Retrieves enterprise description information.
     *
     * @param {*} enterprise Method input.
     * @returns {*} Method result.
     */
    getEnterpriseDescription: function (enterprise) {
        return new Promise((resolve, reject) => {
            this.LOG.debug('Setting enterprice dexription: ' + enterprise.description);
            resolve(enterprise.description);
        });
    },

    /**

     * Retrieves enterprise custom information.

     *

     * @param {*} enterprise Method input.

     * @returns {*} Method result.

     */

    getEnterpriseCustom: function (enterprise) {
        return new Promise((resolve, reject) => {
            this.LOG.debug('Setting enterprice custom: ' + enterprise.description + ' Nodics framework');
            resolve(enterprise.description + ' Nodics framework');
        });
    },

};