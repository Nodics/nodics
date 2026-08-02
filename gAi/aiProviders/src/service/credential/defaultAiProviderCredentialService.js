/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiProviders/service/credential/DefaultAiProviderCredentialService
 * @description Resolves backend secret references through an injected or platform secret authority.
 * @layer service
 * @owner aiProviders
 * @override Projects may integrate a vault while preserving reference-only configuration and redaction.
 */
module.exports = {
    /** Resolves a validated backend environment reference without exposing the value to configuration. */
    resolveEnvironment: function (secretReference) {
        const prefix = 'env://';
        if (!secretReference.startsWith(prefix)) return undefined;
        const variableName = secretReference.slice(prefix.length);
        if (!/^[A-Z][A-Z0-9_]{1,127}$/.test(variableName)) {
            throw new Error('AI provider environment secret reference is invalid');
        }
        const value = process.env[variableName];
        if (!value) throw new Error('AI provider environment secret reference did not resolve');
        return value;
    },

    /** Resolves one opaque secret reference without accepting inline caller credentials. */
    resolve: function (secretReference, context) {
        if (!secretReference || typeof secretReference !== 'string') {
            return Promise.reject(new Error('AI provider credential requires a secret reference'));
        }
        try {
            const environmentSecret = this.resolveEnvironment(secretReference);
            if (environmentSecret) return Promise.resolve(environmentSecret);
        } catch (error) {
            return Promise.reject(error);
        }
        const resolver = context && context.secretResolver ||
            (typeof SERVICE !== 'undefined' && SERVICE.DefaultSecretService);
        if (!resolver) return Promise.reject(new Error('AI provider secret resolver is unavailable'));
        const operation = typeof resolver === 'function' ? resolver(secretReference, context) :
            resolver.resolve({ reference: secretReference, tenant: context && (context.tenantCode || context.tenant) });
        return Promise.resolve(operation).then(secret => {
            if (typeof secret !== 'string' || !secret) throw new Error('AI provider secret reference did not resolve');
            return secret;
        });
    }
};
