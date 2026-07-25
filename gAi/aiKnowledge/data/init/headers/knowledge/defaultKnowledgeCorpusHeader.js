/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
