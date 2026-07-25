/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiKnowledge/data/init/headers/knowledge/defaultKnowledgeSourceHeader
 * @description Imports the explicit gDocs source registration through the generated schema service.
 * @layer data
 * @owner aiKnowledge
 * @override Later modules may override the source projection without bypassing gDocs authority.
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
