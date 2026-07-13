/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module gFramework/nSystem/src/service/interceptors/defaultConfigurationSaveInterceptorService
 * @description Implements nSystem default configuration save interceptor service business behavior and extension logic.
 * @layer service
 * @owner nSystem
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    /**

     * Executes merge existing behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @returns {*} Method result.

     */

    mergeExisting: function (request, response) {
        return new Promise((resolve, reject) => {
            SERVICE.DefaultConfigurationService.get({
                tenant: request.tenant,
                searchOptions: {
                    projection: { _id: 0 }
                },
                query: {
                    code: 'currentConfiguration'
                }
            }).then(success => {
                if (success.result && success.result.length > 0) {
                    let configModel = success.result[0];
                    request.module.code = 'currentConfiguration';
                    request.module.active = true;
                    request.module.config = _.merge(configModel.config, request.module.config);
                }
                resolve(true);
            }).catch(error => {
                reject(error);
            });
            resolve(true);
        });
    }
};