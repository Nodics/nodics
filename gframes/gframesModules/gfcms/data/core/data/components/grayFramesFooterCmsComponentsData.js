/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: 'gfFullInfoFooterComponent',
        name: 'gfFullInfoFooterComponent',
        active: true,
        typeCode: 'footerComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        subComponents: [{
            target: 'fullInfoFooterTextComponent',
            active: true,
            index: 1
        }, {
            target: 'copyrightFooterTextComponent',
            active: true,
            index: 1
        }]
    },
    record1: {
        code: 'fullInfoFooterTextComponent',
        name: 'fullInfoFooterTextComponent',
        active: true,
        typeCode: 'textComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        text: 'This is footer content with full information'
    }, record1: {
        code: 'copyrightFooterTextComponent',
        name: 'copyrightFooterTextComponent',
        active: true,
        typeCode: 'textComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        text: '2022 © Copyright by Nodics. All Rights Reserved.'
    }
};