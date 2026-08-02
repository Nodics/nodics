/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
