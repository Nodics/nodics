/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: 'loginHomePage',
        name: 'loginHomePage',
        active: true,
        cmsSite: ['grayFramesEnSite'],
        typeCode: 'loginHomePageType',
        cmsComponents: [{
            target: 'fullInfoHeaderComponent',
            active: true,
            index: 1
        }, {
            target: 'gfLoginHomeContentComponent',
            active: true,
            index: 2
        }, {
            target: 'fullInfoFooterComponent',
            active: true,
            index: 1
        }]
    }
};