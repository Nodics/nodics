/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module startio/envs/startioLocal/cmsStagedServer/src/schemas/schemas
 * @description Defines envs schema metadata, model contracts, and generated capability settings.
 * @layer schemas
 * @owner envs
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    cms: {
        cmsTypeCode: { isVersionedEnabled: true },
        cmsTypeCode2Renderer: { isVersionedEnabled: true },
        cmsSite: { isVersionedEnabled: true },
        cmsComponentDetail: { isVersionedEnabled: true },
        cmsPage: { isVersionedEnabled: true },
        cmsComponent: { isVersionedEnabled: true },
        cmsPageRoute: { isVersionedEnabled: true },
        cmsPageTemplate: { isVersionedEnabled: true },
        cmsSlotDefinition: { isVersionedEnabled: true }
    },
    pricing: {
        priceList: { isVersionedEnabled: true },
        priceListAssignment: { isVersionedEnabled: true },
        priceGroup: { isVersionedEnabled: true },
        priceGroupMember: { isVersionedEnabled: true },
        price: { isVersionedEnabled: true }
    },
    product: {
        productItem: { isVersionedEnabled: true },
        productIdentifier: { isVersionedEnabled: true },
        productCategory: { isVersionedEnabled: true },
        productCategoryAssignment: { isVersionedEnabled: true },
        productAttributeDefinition: { isVersionedEnabled: true },
        productAttributeValue: { isVersionedEnabled: true },
        productClassificationClass: { isVersionedEnabled: true },
        productClassificationAssignment: { isVersionedEnabled: true },
        productVariantAxis: { isVersionedEnabled: true },
        productVariantAssignment: { isVersionedEnabled: true },
        productRelation: { isVersionedEnabled: true },
        productBundleEntry: { isVersionedEnabled: true },
        productPackaging: { isVersionedEnabled: true },
        productMedia: { isVersionedEnabled: true }
    }
};
