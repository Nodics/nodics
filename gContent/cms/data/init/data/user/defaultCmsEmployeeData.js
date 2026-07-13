/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/data/init/data/user/defaultCmsEmployeeData
 * @description Default CMS employee records loaded by the CMS initial-data importer.
 * @layer data
 * @owner cms
 * @override Project modules may provide later CMS employee data contributions for project-specific users.
 */
module.exports = {
    record0: {
        code: 'contentManager',
        active: true,
        name: {
            title: 'Mr.',
            firstName: 'workflow',
            lastName: 'Admin',
        },
        loginId: 'contentManager',
        password: {
            loginId: 'contentManager',
            password: 'contentManager',
            active: true
        },
        apiKey: '944515ac-bbac-51cd-ac7e-3bbbsdc835ff',
        userGroups: ['contentManagerGroup'],
        addresses: ['defaultEmployeeAddress'],
        contacts: ['defaultEmployeeContact']
    },
    record1: {
        code: 'contentCreator',
        active: true,
        name: {
            title: 'Mr.',
            firstName: 'Content',
            lastName: 'Creator',
        },
        loginId: 'contentCreator',
        password: {
            loginId: 'contentCreator',
            password: 'contentCreator',
            active: true
        },
        apiKey: '944515ac-bbac-51cd-ac7e-3bbbsdc835ff',
        userGroups: ['contentCreaterGroup'],
        addresses: ['defaultEmployeeAddress'],
        contacts: ['defaultEmployeeContact']
    },
    record2: {
        code: 'contentApprover',
        active: true,
        name: {
            title: 'Mr.',
            firstName: 'Content',
            lastName: 'Approver',
        },
        loginId: 'contentApprover',
        password: {
            loginId: 'contentApprover',
            password: 'contentApprover',
            active: true
        },
        apiKey: '944515ac-bbac-51cd-ac7e-3bbbsdc345ff',
        userGroups: ['contentApproverGroup'],
        addresses: ['defaultEmployeeAddress'],
        contacts: ['defaultEmployeeContact']
    }
};
