/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');
/**
 * @module gCore/profile/src/service/search/defaultEnterpriseIndexProcessorService
 * @description Implements profile default enterprise index processor service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /**

     * Executes enterprise index processor behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    enterpriseIndexProcessor: function (request) {
        return new Promise((resolve, reject) => {
            this.LOG.debug('DefaultEnterpriseIndexProcessorService.enterpriseIndexProcessor');
            //let newModel = _.merge({}, request.models[0]);
            //newModel.code = 'NewDefault';
            //request.models.push(newModel);
            resolve(true);
        });
    }
};