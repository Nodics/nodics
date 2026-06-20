/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    generateAPIKey: function (request, response) {
        return new Promise((resolve, reject) => {
            try {
                let model = request.model || {};
                let values = model.$set || model;
                let explicitRotation = values.rotateAPIKey === true;
                delete values.rotateAPIKey;
                if (explicitRotation || CONFIG.get('forceAPIKeyGenerate') === true) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Server-generated API-key rotation is disabled; use the governed credential rotation operation with a client-generated key');
                if (values.apiKeyHash && !(request.authData && request.authData.isSystem === true)) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'API-key digests may only be written by the governed credential service');
                if (values.apiKey && values.principalType !== 'service') throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Plaintext API keys are accepted only when creating an explicit service principal');
                if (!UTILS.isBlank(values) && values.principalType === 'service' && values.apiKey) {
                    let credential = SERVICE.DefaultAPIKeyCredentialService.prepare(values.apiKey);
                    delete values.apiKey;
                    Object.assign(values, credential);
                    let apiKey = CONFIG.get('authSecurity') && CONFIG.get('authSecurity').apiKey || {};
                    if (apiKey.defaultLifetimeSeconds && !values.apiKeyExpiresAt) {
                        values.apiKeyExpiresAt = new Date(Date.now() + apiKey.defaultLifetimeSeconds * 1000);
                    }
                    if (model.$set) model.$unset = Object.assign({}, model.$unset || {}, { apiKey: 1 });
                }
                resolve(true);
            } catch (error) {
                reject(new CLASSES.NodicsError(error));
            }
        });
    }
};
