/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module aiKnowledge/data/init/data/knowledge/defaultKnowledgeCorpusData
 * @description Defines the inactive OOTB corpus for explicitly contributed Nodics documentation.
 * @layer data
 * @owner aiKnowledge
 * @override Projects may contribute separate corpora through later initial-data layers.
 */
module.exports = {
    record0: {
        code: 'nodicsDocumentation',
        corpusCode: 'nodicsDocumentation',
        name: 'Nodics Documentation',
        tenantCode: 'default',
        audience: 'DEVELOPER',
        locale: 'en',
        state: 'DRAFT',
        revision: 0,
        active: true
    }
};
