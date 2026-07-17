/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gCore/profile/src/service/enterprise/defaultEnterpriseService
 * @description Implements profile default enterprise service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /**
     * Retrieves enterprise information.
     *
     * @param {*} entCode Method input.
     * @returns {*} Method result.
     */
    retrieveEnterprise: function (entCode) {
        return new Promise((resolve, reject) => {
            if (UTILS.isBlank(entCode)) {
                reject(new CLASSES.NodicsError('ERR_PRFL_00003', 'Enterprise code can not be null or empty'));
            } else {
                this.get({
                    tenant: CONFIG.get('defaultTenant') || 'default',
                    authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
                    options: {
                        recursive: true
                    },
                    query: {
                        code: entCode
                    }
                }).then(enterprises => {
                    if (enterprises.result.length !== 1) {
                        reject(new CLASSES.NodicsError('ERR_PRFL_00003', 'None enterprise found for code: ' + entCode));
                    } else if (!enterprises.result[0].active || !enterprises.result[0].tenant || enterprises.result[0].tenant.active === false) {
                        reject(new CLASSES.NodicsError('ERR_AUTH_00003', 'Enterprise or tenant is inactive'));
                    } else {
                        resolve(enterprises.result[0]);
                    }
                }).catch(error => {
                    reject(error);
                });
            }
        });
    },
};
