/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module openAiProvider/config/properties
 * @description Contributes disabled OpenAI defaults to the provider-neutral gateway.
 * @layer config
 * @owner openAiProvider
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    aiProviders: {
        providers: {
            openAi: {
                enabled: false,
                secretReference: 'env://OPENAI_API_KEY',
                baseUrl: 'https://api.openai.com/v1',
                timeoutMs: 30000,
                maximumResponseBytes: 1048576
            }
        },
        pricing: {
            models: {
                'openAi:gpt-5-mini': {
                    revision: 'openai-public-rate-2026-07-25',
                    currencyCode: 'USD',
                    inputPerMillion: '0.25000000',
                    cachedInputPerMillion: '0.02500000',
                    outputPerMillion: '2.00000000'
                }
            }
        }
    }
};
