/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
