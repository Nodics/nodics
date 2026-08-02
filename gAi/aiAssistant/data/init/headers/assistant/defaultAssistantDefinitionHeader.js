/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiAssistant/data/init/headers/assistant/DefaultAssistantDefinitionHeader
 * @description Imports the OOTB Axis Assistant definition through its generated schema service.
 * @layer data
 * @owner aiAssistant
 */
module.exports = {
    aiAssistant: {
        defaultAssistantDefinition: {
            options: {
                enabled: true,
                schemaName: 'assistantDefinition',
                operation: 'saveAll',
                dataFilePrefix: 'defaultAssistantDefinitionData'
            },
            query: { definitionCode: '$definitionCode' }
        }
    }
};
