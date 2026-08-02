/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
