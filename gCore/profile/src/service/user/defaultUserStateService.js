/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/profile/src/service/user/defaultUserStateService
 * @description Implements profile default user state service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /**
     * Retrieves user state information.
     *
     * @param {*} request Method input.
     * @returns {*} Method result.
     */
    findUserState: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.get({
                tenant: request.tenant,
                authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
                query: {
                    $and: [{
                        loginId: request.loginId,
                    }, {
                        personId: request._id
                    }]
                }
            }).then(actives => {
                if (actives.result.length <= 0) {
                    resolve({
                        loginId: request.loginId,
                        personId: request._id,
                        attempts: 0,
                        active: true
                    });
                } else {
                    resolve(actives.result[0]);
                }
            }).catch(error => {
                reject(new CLASSES.NodicsError(error, 'Could not resolve authentication state', 'ERR_AUTH_00000'));
            });
        });
    },

};
