/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    // *********************************** Login Page components Start ***************************************
    record100: {
        code: 'gfLoginPageContentComponent',
        name: 'gfLoginPageContentComponent',
        active: true,
        typeCode: 'mainComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        subComponents: [{
            target: 'gfLoginLeftContentSection',
            active: true,
            index: 1
        }, {
            target: 'gfLoginRightContentSection',
            active: true,
            index: 2
        }]
    },
    record101: {
        code: 'gfLoginLeftContentSection',
        name: 'gfLoginLeftContentSection',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        active: true,
        typeCode: 'mainComponentType',
        subComponents: [{
            target: 'gfLoginLeftImageComponent',
            active: true,
            index: 1
        }, {
            target: 'gfLoginLeftTextComponent',
            active: true,
            index: 1
        }]
    },
    record102: {
        code: 'gfLoginLeftTextComponent',
        active: true,
        typeCode: 'textComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        text: 'Gray Frames'
    },
    record103: {
        code: 'gfLoginLeftImageComponent',
        active: true,
        typeCode: 'imageComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        media: {
            name: 'Compnay logo image',
            url: 'http://nodics.com/wp-content/uploads/2018/06/Nodics_Architecture.jpg'
        }
    },

    record104: {
        code: 'gfLoginRightContentSection',
        name: 'gfLoginRightContentSection',
        active: true,
        typeCode: 'mainComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        subComponents: [{
            target: 'gfLoginRightTitleTextComponent',
            active: true,
            index: 1
        }, {
            target: 'gfLoginRightLoginFrameTextComponent',
            active: true,
            index: 2
        }, {
            target: 'gfLoginRightInfoTextComponent',
            active: true,
            index: 3
        }]
    },
    record105: {
        code: 'gfLoginRightTitleTextComponent',
        active: true,
        typeCode: 'textComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        text: 'Login to explore METAVERSE'
    },
    record106: {
        code: 'gfLoginRightLoginFrameTextComponent',
        active: true,
        typeCode: 'textComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
    },

    record107: {
        code: 'gfLoginRightInfoTextComponent',
        active: true,
        typeCode: 'textComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        text: 'By using GrayFrames, please can connect with world that is in thier memory'
    },
    // *********************************** Login Page components End ***************************************
    // *********************************** SignUp Page components Start ***************************************
    record200: {
        code: 'gfSignUpPageContentComponent',
        name: 'gfSignUpPageContentComponent',
        active: true,
        typeCode: 'mainComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        subComponents: [{
            target: 'gfSignUpPageTitleSection',
            active: true,
            index: 1
        }, {
            target: 'gfSignUpPageMainSection',
            active: true,
            index: 2
        }, {
            target: 'gfSignUpPageInfoSection',
            active: true,
            index: 3
        }, {
            target: 'gfSignUpPageButtonsSection',
            active: true,
            index: 4
        }]
    },
    record201: {
        code: 'gfSignUpPageTitleSection',
        active: true,
        typeCode: 'titleComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        subComponents: [{
            target: 'gfSignUpPageTitleMainSection',
            active: true,
            index: 1
        }, {
            target: 'gfSignUpPageTitleSubSection',
            active: true,
            index: 2
        }]
    },
    record202: {
        code: 'gfSignUpPageTitleMainSection',
        active: true,
        typeCode: 'textComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        text: 'Gray Frames'
    },
    record203: {
        code: 'gfSignUpPageTitleSubSection',
        active: true,
        typeCode: 'textComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        text: 'Connect with loved one'
    },
    record204: {
        code: 'gfSignUpPageMainSection',
        active: true,
        typeCode: 'mainComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        text: 'Gray Frames'
    },
    record205: {
        code: 'gfSignUpPageInfoSection',
        active: true,
        typeCode: 'textComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        text: 'Connect with loved one'
    },
    record206: {
        code: 'gfSignUpPageButtonsSection',
        active: true,
        typeCode: 'buttonComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        text: 'Connect with loved one'
    },
    // *********************************** SignUp Page components End ***************************************

};