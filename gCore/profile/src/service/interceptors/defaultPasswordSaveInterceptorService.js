/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gCore/profile/src/service/interceptors/defaultPasswordSaveInterceptorService
 * @description Implements profile default password save interceptor service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /**
     * Executes encrypt password behavior.
     *
     * @param {*} request Method input.
     * @param {*} response Method input.
     * @returns {*} Method result.
     */
    encryptPassword: function (request, response) {
        return new Promise((resolve, reject) => {
            let password = request.model.password;
            let bcryptHash = typeof password === 'string' && /^\$2[aby]\$\d{2}\$/.test(password);
            if (password && !bcryptHash) {
                UTILS.encryptPassword(password).then(hash => {
                    request.model.password = hash;
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    }
};
