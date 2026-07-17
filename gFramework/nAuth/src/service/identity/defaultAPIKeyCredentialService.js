/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nAuth/service/identity/DefaultAPIKeyCredentialService
 * @description Converts high-entropy API keys into keyed digests so usable credentials are never persisted.
 * @layer service
 * @owner nAuth
 * @override Project modules may replace digest storage with an external secret manager while preserving prepare and digest contracts.
 */
const crypto = require('crypto');

module.exports = {
    /** Fails startup when API-key digest configuration is unsafe. */
    init: function () {
        this.getPolicy();
        return Promise.resolve(true);
    },
    /** Completes service startup without additional state mutation. */
    postInit: function () {
        return Promise.resolve(true);
    },
    /** Returns and validates the effective API-key hashing policy. */
    getPolicy: function () {
        let policy = CONFIG.get('authSecurity') && CONFIG.get('authSecurity').apiKey || {};
        let minimum = policy.minimumPepperLength || 32;
        if (typeof policy.pepper !== 'string' || policy.pepper.length < minimum) {
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'A strong API-key pepper must be supplied through layered authSecurity.apiKey.pepper configuration');
        }
        return policy;
    },
    /** Produces a deterministic keyed digest suitable for indexed lookup. */
    digest: function (apiKey) {
        if (typeof apiKey !== 'string' || apiKey.length < 32) {
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Service API keys must contain at least 32 characters');
        }
        return crypto.createHmac('sha256', this.getPolicy().pepper).update(apiKey, 'utf8').digest('hex');
    },
    /** Builds persistence-safe credential fields for a client-generated key. */
    prepare: function (apiKey) {
        return {
            apiKeyHash: this.digest(apiKey),
            apiKeyPrefix: apiKey.substring(0, 8),
            apiKeyStatus: 'active',
            apiKeyCreatedAt: new Date()
        };
    }
};
