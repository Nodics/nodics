/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module geminiProvider/config/properties
 * @description Contributes disabled Gemini defaults to the provider-neutral gateway.
 * @layer config
 * @owner geminiProvider
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    aiProviders: {
        providers: {
            gemini: {
                enabled: false,
                secretReference: null,
                connectionMode: 'GEMINI_API',
                baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
                vertexBaseUrl: 'https://aiplatform.googleapis.com/v1',
                projectId: null,
                location: 'global',
                timeoutMs: 30000,
                maximumResponseBytes: 1048576
            }
        }
    }
};
