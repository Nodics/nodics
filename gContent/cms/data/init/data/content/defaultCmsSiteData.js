/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/data/init/data/content/defaultCmsSiteData
 * @description Default CMS site records loaded by the CMS initial-data importer.
 * @layer data
 * @owner cms
 * @override Project modules may provide later CMS site data contributions for customer-specific sites.
 */
module.exports = {
    record0: {
        code: 'defaultCmsSite',
        name: 'defaultCmsSite',
        catalog: 'defaultContentCatalog',
        accessGroups: ['userGroup'],
        active: true,
    }
};
