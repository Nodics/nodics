/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gContent/cms/src/utils/statusDefinitions.js
 * @description Provides shared cms status and error definition exports.
 * @layer utils
 * @owner cms
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    CMS_DELIVERY_CONTEXT_INVALID: { code: '400', message: 'CMS delivery context is invalid' },
    CMS_DELIVERY_PATH_INVALID: { code: '400', message: 'CMS delivery path is invalid' },
    CMS_COMPONENT_ACCESS_DENIED: { code: '403', message: 'CMS component access is denied' },
    CMS_ROUTE_NOT_FOUND: { code: '404', message: 'CMS route was not found' },
    CMS_PAGE_NOT_FOUND: { code: '404', message: 'CMS page was not found' },
    CMS_PAGE_TEMPLATE_NOT_FOUND: { code: '404', message: 'CMS page template was not found' },
    CMS_PUBLICATION_POINTER_NOT_FOUND: { code: '404', message: 'CMS publication pointer was not found' },
    CMS_PUBLICATION_MANIFEST_NOT_FOUND: { code: '404', message: 'CMS publication manifest was not found' },
    CMS_GRAPH_DEPTH_EXCEEDED: { code: '422', message: 'CMS component graph exceeds the configured depth' },
    CMS_GRAPH_SIZE_EXCEEDED: { code: '422', message: 'CMS component graph exceeds the configured size' },
    ERR_CMS_00080: { code: '401', message: 'CMS Site reference lookup requires service identity' },
    ERR_CMS_00081: { code: '400', message: 'CMS Site reference input is invalid' },
    ERR_CMS_00082: { code: '401', message: 'Active Storefront context is required' },
    ERR_CMS_00083: { code: '500', message: 'CMS delivery configuration is incomplete' }
};
