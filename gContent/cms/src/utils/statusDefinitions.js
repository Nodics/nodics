/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gContent/cms/src/utils/statusDefinitions.js
 * @description Provides shared cms status and error definition exports.
 * @layer utils
 * @owner cms
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    ERR_CMS_00084: { code: '400', message: 'CMS delivery context is invalid' },
    ERR_CMS_00085: { code: '400', message: 'CMS delivery path is invalid' },
    ERR_CMS_00086: { code: '403', message: 'CMS component access is denied' },
    ERR_CMS_00087: { code: '404', message: 'CMS route was not found' },
    ERR_CMS_00088: { code: '404', message: 'CMS page was not found' },
    ERR_CMS_00089: { code: '404', message: 'CMS page template was not found' },
    ERR_CMS_00090: { code: '404', message: 'CMS publication pointer was not found' },
    ERR_CMS_00091: { code: '404', message: 'CMS publication manifest was not found' },
    ERR_CMS_00092: { code: '422', message: 'CMS component graph exceeds the configured depth' },
    ERR_CMS_00093: { code: '422', message: 'CMS component graph exceeds the configured size' },
    ERR_CMS_00080: { code: '401', message: 'CMS Site reference lookup requires service identity' },
    ERR_CMS_00081: { code: '400', message: 'CMS Site reference input is invalid' },
    ERR_CMS_00082: { code: '401', message: 'Active Storefront context is required' },
    ERR_CMS_00083: { code: '500', message: 'CMS delivery configuration is incomplete' },
    ERR_CMS_00094: { code: '400', message: 'CMS component media is invalid' },
    ERR_CMS_00095: { code: '400', message: 'CMS slot definition is invalid' },
    ERR_CMS_00096: { code: '400', message: 'CMS navigation node is invalid' },
    ERR_CMS_00097: { code: '400', message: 'CMS restriction type is invalid' },
    ERR_CMS_00098: { code: '400', message: 'CMS restriction is invalid' }
};
