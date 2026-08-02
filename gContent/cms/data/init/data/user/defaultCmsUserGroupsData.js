/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
