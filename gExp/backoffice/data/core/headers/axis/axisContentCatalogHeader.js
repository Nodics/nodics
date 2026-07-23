/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/data/core/headers/axis/axisContentCatalogHeader
 * @description Declares the governed core import contract for the initial Nodics Axis CMS composition.
 * @layer data
 * @owner backoffice
 * @override Project modules may replace or extend Axis content through later layered core-data contributions.
 */
module.exports = {
    catalog: {
        axisContentCatalogData: {
            options: {
                enabled: true,
                schemaName: 'catalog',
                operation: 'saveAll',
                dataFilePrefix: 'axisContentCatalogData'
            },
            query: { code: '$code' }
        }
    },
    cms: {
        axisCmsSiteData: {
            options: { enabled: true, schemaName: 'cmsSite', operation: 'saveAll', dataFilePrefix: 'axisCmsSiteData' },
            query: { code: '$code' }
        },
        axisCmsTypeCodeData: {
            options: { enabled: true, schemaName: 'cmsTypeCode', operation: 'saveAll', dataFilePrefix: 'axisCmsTypeCodeData' },
            query: { code: '$code' }
        },
        axisCmsRendererData: {
            options: { enabled: true, schemaName: 'cmsTypeCode2Renderer', operation: 'saveAll', dataFilePrefix: 'axisCmsRendererData' },
            query: { code: '$code' }
        },
        axisCmsSlotData: {
            options: { enabled: true, schemaName: 'cmsSlotDefinition', operation: 'saveAll', dataFilePrefix: 'axisCmsSlotData' },
            query: { code: '$code' }
        },
        axisCmsTemplateData: {
            options: { enabled: true, schemaName: 'cmsPageTemplate', operation: 'saveAll', dataFilePrefix: 'axisCmsTemplateData' },
            query: { code: '$code' }
        },
        axisCmsComponentData: {
            options: { enabled: true, schemaName: 'cmsComponent', operation: 'saveAll', dataFilePrefix: 'axisCmsComponentData' },
            query: { code: '$code' }
        },
        axisCmsPageData: {
            options: { enabled: true, schemaName: 'cmsPage', operation: 'saveAll', dataFilePrefix: 'axisCmsPageData' },
            query: { code: '$code' }
        },
        axisCmsRouteData: {
            options: { enabled: true, schemaName: 'cmsPageRoute', operation: 'saveAll', dataFilePrefix: 'axisCmsRouteData' },
            query: { code: '$code' }
        }
    }
};
