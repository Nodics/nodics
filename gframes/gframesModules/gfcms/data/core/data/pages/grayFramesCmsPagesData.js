/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: 'gfHomePage',
        name: 'gfHomePage',
        active: true,
        cmsSite: ['grayFramesEnSite'],
        typeCode: 'oneHomePageType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        cmsComponents: [{
            target: 'gfFullInfoHeaderComponent',
            active: true,
            index: 1
        }, {
            target: 'gfHomeBannerContentSection',
            active: true,
            index: 2
        }, {
            target: 'gfHomeAboutContentSection',
            active: true,
            index: 2
        }, {
            target: 'gfHomeApproachContentSection',
            active: true,
            index: 2
        }, {
            target: 'gfHomeServicesContentSection',
            active: true,
            index: 2
        }, {
            target: 'gfHomeTeamContentSection',
            active: true,
            index: 2
        }, {
            target: 'gfHomePartnersContentSection',
            active: true,
            index: 2
        }, {
            target: 'gfHomeTestimonialsContentSection',
            active: true,
            index: 2
        }, {
            target: 'gfHomeNewsContentSection',
            active: true,
            index: 2
        }, {
            target: 'gfHomeContactContentSection',
            active: true,
            index: 2
        }, {
            target: 'gfFullInfoFooterComponent',
            active: true,
            index: 1
        }]
    },
    record1: {
        code: 'gfLoginPage',
        name: 'gfLoginPage',
        active: true,
        cmsSite: ['grayFramesEnSite'],
        typeCode: 'loginHomePageType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        cmsComponents: [{
            target: 'fullInfoHeaderComponent',
            active: true,
            index: 1
        }, {
            target: 'gfLoginPageContentComponent',
            active: true,
            index: 2
        }, {
            target: 'fullInfoFooterComponent',
            active: true,
            index: 1
        }]
    },
    record2: {
        code: 'gfSignUpPage',
        name: 'gfSignUpPage',
        active: true,
        cmsSite: ['grayFramesEnSite'],
        typeCode: 'signUpHomePageType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        cmsComponents: [{
            target: 'fullInfoHeaderComponent',
            active: true,
            index: 1
        }, {
            target: 'gfSignUpPageContentComponent',
            active: true,
            index: 2
        }, {
            target: 'fullInfoFooterComponent',
            active: true,
            index: 1
        }]
    }
};