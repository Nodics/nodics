/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    // *********************************** Home Page components Start ***************************************
    record0: {
        code: 'gfHomeBannerContentSection',
        name: 'gfHomeBannerContentSection',
        active: true,
        typeCode: 'homePageBannerComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        subComponents: [{
            target: 'gfHomeBannerOneComponent',
            active: true,
            index: 1
        }, {
            target: 'gfHomeBannerTwoComponent',
            active: true,
            index: 2
        }, {
            target: 'gfHomeBannerThreeComponent',
            active: true,
            index: 3
        }]
    },
    record1: {
        code: 'gfHomeBannerOneComponent',
        name: 'gfHomeBannerOneComponent',
        active: true,
        typeCode: 'imageComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        media: {
            name: 'Transperant Communication',
            url: 'https://demo.hashthemes.com/hashone/wp-content/uploads/2020/03/banner1.jpg'
        },
        title: 'This is image one title',
        subTitle: 'This is image one sub title'
    },
    record2: {
        code: 'gfHomeBannerTwoComponent',
        name: 'gfHomeBannerTwoComponent',
        active: true,
        typeCode: 'imageComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        media: {
            name: 'Transperant Communication',
            url: 'https://demo.hashthemes.com/hashone/wp-content/uploads/2020/03/banner2.jpg'
        },
        title: 'This is image two title',
        subTitle: 'This is image two sub title'
    },
    record3: {
        code: 'gfHomeBannerThreeComponent',
        name: 'gfHomeBannerThreeComponent',
        active: true,
        typeCode: 'imageComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        media: {
            name: 'Transperant Communication',
            url: 'https://demo.hashthemes.com/hashone/wp-content/uploads/2020/03/banner3.jpg'
        },
        title: 'This is image three title',
        subTitle: 'This is image three sub title'
    },
    record4: {
        code: 'gfHomeAboutContentSection',
        name: 'gfHomeAboutContentSection',
        active: true,
        typeCode: 'homePageSectionComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        subComponents: [{
            target: 'gfHomeAboutDetailComponent',
            active: true,
            index: 1
        }, {
            target: 'gfHomeJoinUsComponent',
            active: true,
            index: 2
        }]
    },
    record5: {
        code: 'gfHomeAboutDetailComponent',
        name: 'gfHomeAboutDetailComponent',
        active: true,
        typeCode: 'mainComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        subComponents: [{
            target: 'gfHomeAboutDetailTitleComponent',
            active: true,
            index: 1
        }, {
            target: 'gfHomeAboutDetailParaOneComponent',
            active: true,
            index: 2
        }, {
            target: 'gfHomeAboutDetailParaTwoComponent',
            active: true,
            index: 2
        }]
    },
    record6: {
        code: 'gfHomeAboutDetailTitleComponent',
        name: 'gfHomeAboutDetailTitleComponent',
        active: true,
        typeCode: 'textComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup']
    },
    record7: {
        code: 'gfHomeAboutDetailParaOneComponent',
        name: 'gfHomeAboutDetailParaOneComponent',
        active: true,
        typeCode: 'paragraphComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup']
    },
    record8: {
        code: 'gfHomeAboutDetailParaTwoComponent',
        name: 'gfHomeAboutDetailParaTwoComponent',
        active: true,
        typeCode: 'paragraphComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup']
    },
    record9: {
        code: 'gfHomeJoinUsComponent',
        name: 'gfHomeJoinUsComponent',
        active: true,
        typeCode: 'mainComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        subComponents: [{
            target: 'gfHomeJoinUsTitleComponent',
            active: true,
            index: 1
        }, {
            target: 'gfHomeJoinUsMainBodyComponent',
            active: true,
            index: 2
        }, {
            target: 'gfHomeJoinUsTermComponent',
            active: true,
            index: 3
        }]
    },
    record10: {
        code: 'gfHomeJoinUsTitleComponent',
        name: 'gfHomeJoinUsTitleComponent',
        active: true,
        typeCode: 'textComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup']
    },
    record11: {
        code: 'gfHomeJoinUsMainBodyComponent',
        name: 'gfHomeJoinUsMainBodyComponent',
        active: true,
        typeCode: 'mainComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup']
    },
    record12: {
        code: 'gfHomeJoinUsTermComponent',
        name: 'gfHomeJoinUsTermComponent',
        active: true,
        typeCode: 'htmlComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup']
    },
    record13: {
        code: 'gfHomeApproachContentSection',
        name: 'gfHomeApproachContentSection',
        active: true,
        typeCode: 'homePageSectionComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        title: 'Our Approach',
        subTitle: 'We are focused on providing our clients with the highest level of quality and excellent customer support.',
        subComponents: [{
            target: 'gfHomeApproachOne',
            active: true,
            index: 1
        }, {
            target: 'gfHomeApproachTwo',
            active: true,
            index: 2
        }, {
            target: 'gfHomeApproachThree',
            active: true,
            index: 3
        }, {
            target: 'gfHomeApproachFour',
            active: true,
            index: 3
        }]
    },
    record14: {
        code: 'gfHomeApproachOne',
        name: 'gfHomeApproachOne',
        active: true,
        typeCode: 'approachBoxComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        imageClass: 'fa fa-plane',
        title: 'DEVELOP OBJECTIVES',
        text: 'Arcu felis bibendum ut tristique et egestas quis bibendum ut tristique et egestas quis ipsum suspend...'
    },
    record15: {
        code: 'gfHomeApproachTwo',
        name: 'gfHomeApproachTwo',
        active: true,
        typeCode: 'approachBoxComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        imageClass: 'fa fa-cube',
        title: 'DEVELOP OBJECTIVES',
        text: 'Arcu felis bibendum ut tristique et egestas quis bibendum ut tristique et egestas quis ipsum suspend...'
    },
    record16: {
        code: 'gfHomeApproachThree',
        name: 'gfHomeApproachThree',
        active: true,
        typeCode: 'approachBoxComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        imageClass: 'fa fa-hourglass-2',
        title: 'DEVELOP OBJECTIVES',
        text: 'Arcu felis bibendum ut tristique et egestas quis bibendum ut tristique et egestas quis ipsum suspend...'
    },
    record17: {
        code: 'gfHomeApproachFour',
        name: 'gfHomeApproachFour',
        active: true,
        typeCode: 'approachBoxComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        imageClass: 'fa fa-magic',
        title: 'DEVELOP OBJECTIVES',
        text: 'Arcu felis bibendum ut tristique et egestas quis bibendum ut tristique et egestas quis ipsum suspend...'
    },
    record18: {
        code: 'gfHomeServicesContentSection',
        name: 'gfHomeServicesContentSection',
        active: true,
        typeCode: 'homePageSectionComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup']
    },
    record19: {
        code: 'gfHomeTeamContentSection',
        name: 'gfHomeTeamContentSection',
        active: true,
        typeCode: 'homePageSectionComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup']
    },
    record20: {
        code: 'gfHomePartnersContentSection',
        name: 'gfHomePartnersContentSection',
        active: true,
        typeCode: 'homePageSectionComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup']
    },
    record21: {
        code: 'gfHomeTestimonialsContentSection',
        name: 'gfHomeTestimonialsContentSection',
        active: true,
        typeCode: 'homePageSectionComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup']
    },
    record22: {
        code: 'gfHomeNewsContentSection',
        name: 'gfHomeNewsContentSection',
        active: true,
        typeCode: 'homePageSectionComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup']
    },
    record23: {
        code: 'gfHomeContactContentSection',
        name: 'gfHomeContactContentSection',
        active: true,
        typeCode: 'homePageSectionComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup']
    },
    // *********************************** Home Page components End ***************************************
};