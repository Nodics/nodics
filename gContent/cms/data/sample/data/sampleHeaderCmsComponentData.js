/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: 'samplePageHeaderComponent',
        active: true,
        cmsPages: ['sampleHomePage', 'sampleProductDetailPage', 'sampleProductListingPage', 'sampleCartDetailPage'],
        typeCode: 'headerComponentType',
        subComponents: ['sampleLogoComponent']
    },
    record1: {
        code: 'sampleLogoComponent',
        active: true,
        typeCode: 'logoComponentType',
        subComponents: ['sampleLogoImageComponent', 'sampleLogoTextComponent', 'sampleLogoSubTextComponent']
    },
    record2: {
        code: 'sampleLogoImageComponent',
        active: true,
        typeCode: 'imageComponentType',
        media: {
            name: 'Compnay logo image',
            url: 'http://nodics.com/wp-content/uploads/2018/06/Nodics_Architecture.jpg'
        }
    },
    record3: {
        code: 'sampleLogoTextComponent',
        active: true,
        typeCode: 'textComponentType',
        logoTitle: 'Nodics'
    },
    record4: {
        code: 'sampleLogoSubTextComponent',
        active: true,
        typeCode: 'textComponentType',
        logoSubTitle: 'Nodics'
    },
};