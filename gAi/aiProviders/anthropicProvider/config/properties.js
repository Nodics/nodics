/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module anthropicProvider/config/properties
 * @description Contributes disabled Anthropic defaults to the provider-neutral gateway.
 * @layer config
 * @owner anthropicProvider
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    aiProviders: {
        providers: {
            anthropic: {
                enabled: false,
                secretReference: null,
                baseUrl: 'https://api.anthropic.com/v1',
                apiVersion: '2023-06-01',
                timeoutMs: 30000,
                maximumResponseBytes: 1048576
            }
        }
    }
};
