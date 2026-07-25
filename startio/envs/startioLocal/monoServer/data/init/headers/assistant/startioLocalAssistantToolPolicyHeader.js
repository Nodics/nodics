/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module monoServer/data/init/headers/assistant/StartioLocalAssistantToolPolicyHeader
 * @description Imports the local monoServer Assistant read-tool activation through the generated Assistant policy service.
 * @layer data
 * @owner monoServer
 * @override Other server modules may contribute separate environment-specific policy state without changing reusable defaults.
 */
module.exports = {
    aiAssistant: {
        startioLocalAssistantToolPolicy: {
            options: {
                enabled: true,
                schemaName: 'assistantToolPolicy',
                operation: 'saveAll',
                dataFilePrefix: 'startioLocalAssistantToolPolicyData',
                owningModule: 'monoServer'
            },
            query: { policyCode: '$policyCode' }
        }
    }
};
