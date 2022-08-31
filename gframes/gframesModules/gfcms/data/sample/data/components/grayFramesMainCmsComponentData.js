/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: 'gfLoginHomeContentComponent',
        name: 'gfLoginHomeContentComponent',
        active: true,
        typeCode: 'mainComponentType',
        subComponents: [{
            target: 'gfLoginHomeRightContentComponent',
            active: true,
            index: 2
        }, {
            target: 'gfLoginHomeLeftContentComponent',
            active: true,
            index: 1
        }]
    },
    record1: {
        code: 'gfLoginHomeLeftContentComponent',
        name: 'gfLoginHomeLeftContentComponent',
        active: true,
        typeCode: 'mainComponentType',
        subComponents: [{
            target: 'gfLoginHomeLeftTextComponent',
            active: true,
            index: 1
        }, {
            target: 'gfLoginHomeLeftImageComponent',
            active: true,
            index: 1
        }]
    },
    record3: {
        code: 'gfLoginHomeLeftTextComponent',
        active: true,
        typeCode: 'textComponentType',
        text: 'Gray Frames'
    },
    record2: {
        code: 'gfLoginHomeLeftImageComponent',
        active: true,
        typeCode: 'imageComponentType',
        media: {
            name: 'Compnay logo image',
            url: 'http://nodics.com/wp-content/uploads/2018/06/Nodics_Architecture.jpg'
        }
    },

    record4: {
        code: 'gfLoginHomeRightContentComponent',
        name: 'gfLoginHomeRightContentComponent',
        active: true,
        typeCode: 'mainComponentType',
        subComponents: [{
            target: 'gfLoginHomeRightTitleTextComponent',
            active: true,
            index: 1
        }, {
            target: 'gfLoginHomeRightLoginFrameTextComponent',
            active: true,
            index: 2
        }, {
            target: 'gfLoginHomeRightInfoTextComponent',
            active: true,
            index: 3
        }]
    },
    record3: {
        code: 'gfLoginHomeRightTitleTextComponent',
        active: true,
        typeCode: 'textComponentType',
        text: 'Login to explore METAVERSE'
    },
    record4: {
        code: 'gfLoginHomeRightLoginFrameTextComponent',
        active: true,
        typeCode: 'textComponentType'
    },
    record4: {
        code: 'gfLoginHomeRightInfoTextComponent',
        active: true,
        typeCode: 'textComponentType',
        text: 'By using GrayFrames, please can connect with world that is in thier memory'
    }


};