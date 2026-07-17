/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/data/init/data/user/defaultCmsUserGroupsData
 * @description Default CMS user-group records loaded by the CMS initial-data importer.
 * @layer data
 * @owner cms
 * @override Project modules may provide later CMS user-group data contributions for project-specific access models.
 */
module.exports = {
    record0: {
        code: 'contentManagerGroup',
        name: 'contentManagerGroup',
        active: true,
        parentGroups: ['employeeUserGroup']
    },
    record1: {
        code: 'contentCreaterGroup',
        name: 'contentCreaterGroup',
        active: true,
        parentGroups: ['contentManagerGroup']
    },
    record2: {
        code: 'contentApproverGroup',
        name: 'contentApproverGroup',
        active: true,
        parentGroups: ['contentManagerGroup']
    }
};
