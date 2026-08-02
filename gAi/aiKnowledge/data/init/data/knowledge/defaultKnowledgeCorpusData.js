/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
