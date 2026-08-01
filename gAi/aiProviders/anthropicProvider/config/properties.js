/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
