/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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