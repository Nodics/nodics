/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nSearch/search/src/service/query/defaultSearchRequestService
 * @description Validates provider-neutral lexical, vector, and hybrid search requests.
 * @layer service
 * @owner nSearch
 * @override Search adapters translate this normalized contract into provider-specific queries.
 */
module.exports = {
    /** Normalizes and validates a provider-neutral search request against index capabilities. */
    normalize: function (searchRequest, indexDefinition) {
        const request = searchRequest || {};
        const capabilities = indexDefinition.capabilities || {};
        const supportedModes = capabilities.modes || ['LEXICAL'];
        const mode = String(request.mode || 'LEXICAL').toUpperCase();
        if (!supportedModes.includes(mode)) {
            throw new Error('Search mode is not supported by index: ' + mode);
        }
        if ((mode === 'LEXICAL' || mode === 'HYBRID') &&
            (typeof request.text !== 'string' || !request.text.trim())) {
            throw new Error('Lexical and hybrid search require text');
        }
        if ((mode === 'VECTOR' || mode === 'HYBRID') &&
            (!Array.isArray(request.vector) || !request.vector.length)) {
            throw new Error('Vector and hybrid search require a query vector');
        }
        const size = Number(request.size || 10);
        if (!Number.isInteger(size) || size < 1 || size > 1000) {
            throw new Error('Search size must be an integer between 1 and 1000');
        }
        return {
            mode: mode,
            text: request.text && request.text.trim(),
            vector: request.vector,
            vectorField: request.vectorField || capabilities.vectorField || 'embedding',
            fields: request.fields || capabilities.lexicalFields || [],
            filters: request.filters || {},
            size: size,
            minimumScore: request.minimumScore
        };
    }
};
