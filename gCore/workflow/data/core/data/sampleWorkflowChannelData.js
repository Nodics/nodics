/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: "oneChannel",
        name: "oneChannel",
        active: true,
        qualifier: {
            decision: 'ONE'
        },
        target: 'sampleActionOne'
    },

    record1: {
        code: "twoChannel",
        name: "twoChannel",
        active: true,
        qualifier: {
            decision: 'TWO'
        },
        target: 'sampleActionTwo'
    },

    record2: {
        code: "threeChannel",
        name: "threeChannel",
        active: true,
        qualifier: {
            decision: 'THREE'
        },
        target: 'sampleActionThree'
    },

    record3: {
        code: 'sampleChannelSuccess',
        name: 'sampleChannelSuccess',
        active: true,
        qualifier: {
            decision: 'SUCCESS'
        },
        target: 'sampleActionSuccess'
    }
};