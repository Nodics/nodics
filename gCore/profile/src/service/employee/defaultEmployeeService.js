/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    findByLoginId: function (request) {
        return new Promise((resolve, reject) => {
            this.get({
                tenant: request.tenant,
                authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
                options: {
                    recursive: true,
                },
                query: {
                    loginId: request.loginId
                }
            }).then(employees => {
                if (employees.result.length !== 1) {
                    reject(new CLASSES.NodicsError('ERR_PRFL_00003', 'Invalid login id: ' + request.loginId));
                } else {
                    resolve(employees.result[0]);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },

    findByAPIKey: function (request) {
        return new Promise((resolve, reject) => {
            let policy = CONFIG.get('authSecurity') && CONFIG.get('authSecurity').apiKey || {};
            let apiKeyHash;
            try {
                apiKeyHash = SERVICE.DefaultAPIKeyCredentialService.digest(request.apiKey);
            } catch (error) {
                reject(error);
                return;
            }
            let find = query => this.get({
                tenant: request.tenant,
                authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
                options: {
                    recursive: true,
                },
                query: Object.assign({ active: true }, query)
            });
            find({ apiKeyHash: apiKeyHash }).then(employees => {
                if (employees.result.length === 0 && policy.allowLegacyPlaintextLookup === true) {
                    return find({ apiKey: request.apiKey });
                }
                return employees;
            }).then(employees => {
                if (employees.result.length !== 1) {
                    reject(new CLASSES.NodicsError('ERR_PRFL_00003', 'Invalid apiKey'));
                } else {
                    let employee = employees.result[0];
                    let status = employee.apiKeyStatus || 'active';
                    let expired = employee.apiKeyExpiresAt && new Date(employee.apiKeyExpiresAt).getTime() <= Date.now();
                    let invalidPrincipal = employee.principalType !== 'service' &&
                        !(employee.principalType === undefined && policy.allowLegacyHumanPrincipals === true);
                    if (invalidPrincipal || status !== 'active' || expired || (policy.requireScopes === true && (!employee.apiKeyScopes || employee.apiKeyScopes.length === 0))) {
                        reject(new CLASSES.NodicsError('ERR_PRFL_00003', 'API key is inactive, expired, or outside policy'));
                    } else {
                        resolve(employee);
                    }
                }
            }).catch(error => {
                reject(error);
            });
        });
    }
};
