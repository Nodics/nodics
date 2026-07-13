/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
