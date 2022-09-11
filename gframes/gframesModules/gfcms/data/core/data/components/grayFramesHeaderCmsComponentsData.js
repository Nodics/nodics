/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: 'gfFullInfoHeaderComponent',
        active: true,
        typeCode: 'headerStickyComponentType',

        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        subComponents: [{
            target: 'gfLogoOneComponent',
            active: true,
            index: 1
        }, {
            target: 'gfHeaderMenuComponent',
            active: true,
            index: 1
        }]
    },
    record1: {
        code: 'gfLogoOneComponent',
        active: true,
        typeCode: 'logoComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        subComponents: [{
            target: 'gfLogoOneImageComponent',
            active: true,
            index: 1
        }, {
            target: 'gfLogoOneTextComponent',
            active: true,
            index: 1
        }, {
            target: 'gfLogoOneSubTextComponent',
            active: true,
            index: 1
        }]
    },
    record2: {
        code: 'gfLogoOneImageComponent',
        active: true,
        typeCode: 'imageComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        media: {
            name: 'Compnay logo image',
            url: 'http://nodics.com/wp-content/uploads/2018/06/Nodics_Architecture.jpg'
        }
    },
    record3: {
        code: 'gfLogoOneTextComponent',
        active: true,
        typeCode: 'textComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        text: 'Gray Frames'
    },
    record4: {
        code: 'gfLogoOneSubTextComponent',
        active: true,
        typeCode: 'textComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        text: 'Connect with loved one'
    },
    record5: {
        code: 'gfHeaderMenuComponent',
        active: true,
        typeCode: 'menuComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup']
    },
};