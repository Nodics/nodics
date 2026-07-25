/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiAssistant/data/init/data/assistant/DefaultAssistantToolPolicyData
 * @description Defines the inactive OOTB allowlist for the first employee read-only BackOffice operation.
 * @layer data
 * @owner aiAssistant
 * @override Projects may activate a reviewed policy or add separate policies without accepting model-supplied routes or methods.
 */
module.exports = {
    record0: {
        code: 'axisAssistantReadOnly',
        policyCode: 'axisAssistantReadOnly',
        contractVersion: 1,
        approvedOperations: [{
            toolId: 'backoffice.catalogue.read',
            ownerModule: 'backoffice',
            operationId: 'backoffice_bootstrap',
            mode: 'READ',
            requiredPermissions: ['backoffice.bootstrap.view'],
            resultFields: ['compatibility', 'catalogue', 'availability'],
            description: 'Return the authorized active Nodics module catalogue and availability summary.',
            inputSchema: {
                type: 'object',
                additionalProperties: false,
                properties: {
                    pathParameters: { type: 'object', additionalProperties: false },
                    queryParameters: { type: 'object', additionalProperties: false }
                }
            }
        }, {
            toolId: 'profile.enterprise.search',
            ownerModule: 'profile',
            operationId: 'profile_searchenterprises',
            mode: 'READ',
            requiredPermissions: ['profile.enterprise.search'],
            resultFields: ['page', 'limit', 'count', 'items'],
            description: 'Search a bounded, client-safe list of enterprises by exact code, name, or active state.',
            inputSchema: {
                type: 'object',
                additionalProperties: false,
                properties: {
                    pathParameters: { type: 'object', additionalProperties: false },
                    queryParameters: {
                        type: 'object',
                        additionalProperties: false,
                        properties: {
                            code: { type: 'string', maxLength: 128 },
                            name: { type: 'string', maxLength: 256 },
                            active: { type: 'boolean' },
                            page: { type: 'integer', minimum: 1, maximum: 10000 },
                            limit: { type: 'integer', minimum: 1, maximum: 100 }
                        }
                    }
                }
            }
        }],
        enabled: false,
        revision: 0,
        active: true
    }
};
