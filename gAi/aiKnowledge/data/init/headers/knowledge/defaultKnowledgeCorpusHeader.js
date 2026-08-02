/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiKnowledge/data/init/headers/knowledge/defaultKnowledgeCorpusHeader
 * @description Imports the OOTB Nodics documentation corpus through the generated schema service.
 * @layer data
 * @owner aiKnowledge
 * @override Later modules may override the record while preserving corpus ownership and tenant isolation.
 */
module.exports = {
    aiKnowledge: {
        defaultKnowledgeCorpus: {
            options: {
                enabled: true,
                schemaName: 'knowledgeCorpus',
                operation: 'saveAll',
                dataFilePrefix: 'defaultKnowledgeCorpusData'
            },
            query: {
                corpusCode: '$corpusCode',
                tenantCode: '$tenantCode'
            }
        }
    }
};
