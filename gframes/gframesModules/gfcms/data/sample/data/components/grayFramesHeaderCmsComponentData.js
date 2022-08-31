/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: 'fullInfoHeaderComponent',
        active: true,
        typeCode: 'headerComponentType',
        subComponents: [{
            target: 'gfLogoOneComponent',
            active: true,
            index: 1
        }]
    },
    record1: {
        code: 'gfLogoOneComponent',
        active: true,
        typeCode: 'logoComponentType',
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
        media: {
            name: 'Compnay logo image',
            url: 'http://nodics.com/wp-content/uploads/2018/06/Nodics_Architecture.jpg'
        }
    },
    record3: {
        code: 'gfLogoOneTextComponent',
        active: true,
        typeCode: 'textComponentType',
        text: 'Gray Frames'
    },
    record4: {
        code: 'gfLogoOneSubTextComponent',
        active: true,
        typeCode: 'textComponentType',
        text: 'Connect with loved one'
    },
};