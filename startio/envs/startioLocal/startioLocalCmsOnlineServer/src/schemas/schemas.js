/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module startioLocalCmsOnlineServer/src/schemas/schemas
 * @description Explicitly keeps Online CMS business and deployment schemas non-versioned.
 * @layer schema
 * @owner startioLocalCmsOnlineServer
 * @override Later Online server layers may extend CMS schemas but must not enable version history in the delivery runtime.
 */
module.exports = {
    cms: {
        cmsTypeCode: { isVersionedEnabled: false },
        cmsTypeCode2Renderer: { isVersionedEnabled: false },
        cmsSite: { isVersionedEnabled: false },
        cmsComponentDetail: { isVersionedEnabled: false },
        cmsPage: { isVersionedEnabled: false },
        cmsComponent: { isVersionedEnabled: false },
        cmsPageRoute: { isVersionedEnabled: false },
        cmsPageTemplate: { isVersionedEnabled: false },
        cmsSlotDefinition: { isVersionedEnabled: false },
        cmsPublicationManifest: { isVersionedEnabled: false },
        cmsOnlinePublicationPointer: { isVersionedEnabled: false },
        cmsPublicationDeploymentReceipt: { isVersionedEnabled: false }
    }
};
