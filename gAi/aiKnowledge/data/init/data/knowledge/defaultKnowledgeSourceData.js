/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module aiKnowledge/data/init/data/knowledge/defaultKnowledgeSourceData
 * @description Registers the external Nodics documentation content pack as an explicit source without transferring publication authority.
 * @layer data
 * @owner aiKnowledge
 * @override Projects may contribute explicit sources and projections through later initial-data layers.
 */
module.exports = {
    record0: {
        code: 'nodicsDocumentationContentPack',
        sourceCode: 'nodicsDocumentationContentPack',
        corpusCode: 'nodicsDocumentation',
        ownerModule: 'nodicsdocs',
        sourceType: 'PARTNER_DOCUMENTATION',
        tenantCode: 'default',
        projection: {
            root: '../nodicsdocs/source/pages',
            contentPack: '../nodicsdocs/manifest/docs-content-pack.json',
            publishedOnly: true,
            excludeTemporaryRootDocs: true
        },
        synchronizationMode: 'MANUAL',
        state: 'ACTIVE',
        active: true
    }
};
