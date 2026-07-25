/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiAssistant/data/init/data/assistant/DefaultAssistantDefinitionData
 * @description Defines the OOTB employee Assistant using only provider-profile, prompt, and Knowledge corpus references.
 * @layer data
 * @owner aiAssistant
 * @override Projects may contribute separate Assistant definitions through later initial-data layers.
 */
module.exports = {
    record0: {
        code: 'axisAssistant',
        definitionCode: 'axisAssistant',
        name: 'Axis Assistant',
        providerProfile: 'assistantGeneration',
        promptCode: 'axisAssistantReadOnly',
        knowledgeCorpusCodes: ['nodicsDocumentation'],
        toolPolicyCode: 'axisAssistantReadOnly',
        enabled: true,
        revision: 0,
        active: true
    }
};
