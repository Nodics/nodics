/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
