/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
