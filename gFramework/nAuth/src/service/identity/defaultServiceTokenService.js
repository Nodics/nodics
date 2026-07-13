/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nAuth/service/identity/DefaultServiceTokenService
 * @description Issues tenant-scoped internal service tokens and registers their
 * current security stamp before the token becomes available to other modules.
 * This makes service identity changes enforceable across modular nodes when the
 * auth cache is distributed.
 * @layer service
 * @owner nAuth
 * @override Project modules may replace service-token issuance with external
 * workload identity while preserving tenant scope, bounded lifetime, and
 * revocation/version validation.
 */
module.exports = {
    /** Issues a bounded service JWT after persisting its current security stamp. */
    issue: function (options) {
        let tokenOptions = Object.assign({}, options || {}, {
            tokenType: 'service',
            principalType: 'service',
            authVersion: options && options.authVersion !== undefined ? options.authVersion : 1
        });
        if (!tokenOptions.tenant || !tokenOptions.serviceId) {
            return Promise.reject(new CLASSES.NodicsError('ERR_AUTH_00003', 'Service token requires tenant and serviceId'));
        }
        return SERVICE.DefaultPrincipalSecurityStampService.register(
            tokenOptions.tenant,
            tokenOptions.serviceId,
            tokenOptions.authVersion
        ).then(() => SERVICE.DefaultAuthenticationProviderService.generateAuthToken(tokenOptions));
    },

    /** Invalidates every existing service token carrying the previous stamp. */
    revoke: function (tenant, serviceId) {
        if (!tenant || !serviceId) return Promise.reject(new CLASSES.NodicsError('ERR_AUTH_00003', 'Service token revocation requires tenant and serviceId'));
        let nextVersion = Date.now();
        return SERVICE.DefaultPrincipalSecurityStampService.register(tenant, serviceId, nextVersion).then(() => nextVersion);
    }
};
