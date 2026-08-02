/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiKnowledge/data/init/headers/knowledge/defaultKnowledgeSourceHeader
 * @description Imports the explicit external documentation content-pack source registration through the generated schema service.
 * @layer data
 * @owner aiKnowledge
 * @override Later modules may override the source projection without bypassing the documentation content-pack authority.
 */
module.exports = {
    aiKnowledge: {
        defaultKnowledgeSource: {
            options: {
                enabled: true,
                schemaName: 'knowledgeSource',
                operation: 'saveAll',
                dataFilePrefix: 'defaultKnowledgeSourceData'
            },
            query: {
                sourceCode: '$sourceCode',
                tenantCode: '$tenantCode'
            }
        }
    }
};
