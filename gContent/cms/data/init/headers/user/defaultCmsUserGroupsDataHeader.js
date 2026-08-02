/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/data/init/headers/user/defaultCmsUserGroupsDataHeader
 * @description Initial-data import header for default CMS user-group records.
 * @layer data
 * @owner cms
 * @override Project modules may supply later headers to change CMS user-group import behavior.
 */
module.exports = {
    profile: {
        defaultCmsUserGroups: {
            options: {
                enabled: true,
                schemaName: 'userGroup',
                operation: 'saveAll', //saveAll, update and saveOrUpdate
                dataFilePrefix: 'defaultCmsUserGroupsData'
            },
            query: {
                code: '$code'
            }
        }
    }
};
