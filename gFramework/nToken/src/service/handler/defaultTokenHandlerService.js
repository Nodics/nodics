/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nToken/src/service/handler/defaultTokenHandlerService
 * @description Implements nToken default token handler service business behavior and extension logic.
 * @layer service
 * @owner nToken
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**

     * Executes generate token behavior.

     *

     * @param {*} request Method input.

     * @returns {*} Method result.

     */

    generateToken: function (request) {
        let _self = this;
        try {
            let tokenConfig = CONFIG.get('token')[request.type];
            let generatedToken = SERVICE[tokenConfig.tokenHandler]['generateToken'](request);
            _self.LOG.debug('Generated Token: ', generatedToken);
            return String(generatedToken);
        } catch (error) {
            throw new CLASSES.NodicsError(error, 'While generating Token', 'ERR_TKN_00000');
        }
    },
    /**
     * Executes generate expiry behavior.
     *
     * @param {*} request Method input.
     * @returns {*} Method result.
     */
    generateExpiry: function (request) {
        let _self = this;
        try {
            let tokenConfig = CONFIG.get('token')[request.type];
            let life = SERVICE[tokenConfig.tokenHandler]['generateExpiry'](request);
            _self.LOG.debug('Token Expire at: ', life);
            return life;
        } catch (error) {
            throw new CLASSES.NodicsError(error, 'While generating Token', 'ERR_TKN_00000');
        }
    }
};