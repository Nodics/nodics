/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
