/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: 'fullInfoFooterComponent',
        active: true,
        typeCode: 'footerComponentType',
        subComponents: [{
            target: 'fullInfoFooterTextComponent',
            active: true,
            index: 1
        }]
    },
    record1: {
        code: 'mediumInfoFooterComponent',
        active: true,
        typeCode: 'footerComponentType',
        subComponents: [{
            target: 'mediumInfoFooterTextComponent',
            active: true,
            index: 1
        }]
    },
    record2: {
        code: 'fullInfoFooterTextComponent',
        active: true,
        typeCode: 'textComponentType',
        text: 'This is footer content with full information'
    },
    record3: {
        code: 'mediumInfoFooterTextComponent',
        active: true,
        typeCode: 'textComponentType',
        text: 'This is footer content with medium information'
    }
};