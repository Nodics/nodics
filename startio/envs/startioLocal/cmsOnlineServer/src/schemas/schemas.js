/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cmsOnlineServer/src/schemas/schemas
 * @description Explicitly keeps Online CMS business and deployment schemas non-versioned.
 * @layer schema
 * @owner cmsOnlineServer
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
    },
    pricing: {
        priceList: { isVersionedEnabled: false },
        priceListAssignment: { isVersionedEnabled: false },
        priceGroup: { isVersionedEnabled: false },
        priceGroupMember: { isVersionedEnabled: false },
        price: { isVersionedEnabled: false },
        pricePublicationManifest: { isVersionedEnabled: false },
        priceOnlinePointer: { isVersionedEnabled: false },
        pricePublicationReceipt: { isVersionedEnabled: false }
    },
    product: {
        productItem: { isVersionedEnabled: false },
        productIdentifier: { isVersionedEnabled: false },
        productCategory: { isVersionedEnabled: false },
        productCategoryAssignment: { isVersionedEnabled: false },
        productAttributeDefinition: { isVersionedEnabled: false },
        productAttributeValue: { isVersionedEnabled: false },
        productClassificationClass: { isVersionedEnabled: false },
        productClassificationAssignment: { isVersionedEnabled: false },
        productVariantAxis: { isVersionedEnabled: false },
        productVariantAssignment: { isVersionedEnabled: false },
        productRelation: { isVersionedEnabled: false },
        productBundleEntry: { isVersionedEnabled: false },
        productPackaging: { isVersionedEnabled: false },
        productMedia: { isVersionedEnabled: false },
        productReleaseManifest: { isVersionedEnabled: false },
        productOnlinePointer: { isVersionedEnabled: false },
        productPublicationReceipt: { isVersionedEnabled: false }
        ,productProjectionJob: { isVersionedEnabled: false }
    }
};
