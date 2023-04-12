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
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        subComponents: [{
            target: 'gfMenuLinkHome',
            active: true,
            index: 1
        }, {
            target: 'gfMenuLinkAbout',
            active: true,
            index: 1
        }, {
            target: 'gfMenuLinkApproach',
            active: true,
            index: 1
        }, {
            target: 'gfMenuLinkServices',
            active: true,
            index: 1
        }, {
            target: 'gfMenuLinkTeam',
            active: true,
            index: 1
        }, {
            target: 'gfMenuLinkPartners',
            active: true,
            index: 1
        }, {
            target: 'gfMenuLinkTestimonial',
            active: true,
            index: 1
        }, {
            target: 'gfMenuLinkNews',
            active: true,
            index: 1
        }, {
            target: 'gfMenuLinkContactUs',
            active: true,
            index: 1
        }]
    },
    record6: {
        code: 'gfMenuLinkHome',
        active: true,
        typeCode: 'menuLinkComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        name: 'HOME',
        link: '#',
        code: 'homeLink',
    },
    record7: {
        code: 'gfMenuLinkApproach',
        active: true,
        typeCode: 'menuLinkComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        name: 'APPROACH',
        link: '#',
        code: 'approachLink',
    },
    record8: {
        code: 'gfMenuLinkServices',
        active: true,
        typeCode: 'menuLinkComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        name: 'SERVICES',
        link: '#',
        code: 'servicesLink',
    },
    record9: {
        code: 'gfMenuLinkTeam',
        active: true,
        typeCode: 'menuLinkComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        name: 'TEAM',
        link: '#',
        code: 'teamLink',
    },
    record10: {
        code: 'gfMenuLinkPartners',
        active: true,
        typeCode: 'menuLinkComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        name: 'PARTNERS',
        link: '#',
        code: 'partnersLink',
    },
    record11: {
        code: 'gfMenuLinkTestimonial',
        active: true,
        typeCode: 'menuLinkComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        name: 'TESTIMONIAL',
        link: '#',
        code: 'testimonialLink',
    },
    record12: {
        code: 'gfMenuLinkNews',
        active: true,
        typeCode: 'menuLinkComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        name: 'BLOG',
        link: '#',
        code: 'newsLink',
    },
    record13: {
        code: 'gfMenuLinkContactUs',
        active: true,
        typeCode: 'menuLinkComponentType',
        userGroups: ['customerUserGroup', 'employeeUserGroup'],
        name: 'CONTACT',
        link: '#',
        code: 'contactLink',
    }
};