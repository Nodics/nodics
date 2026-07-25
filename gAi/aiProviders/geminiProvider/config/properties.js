/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
                secretReference: undefined,
                connectionMode: 'GEMINI_API',
                baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
                vertexBaseUrl: 'https://aiplatform.googleapis.com/v1',
                projectId: undefined,
                location: 'global',
                timeoutMs: 30000,
                maximumResponseBytes: 1048576
            }
        }
    }
};
