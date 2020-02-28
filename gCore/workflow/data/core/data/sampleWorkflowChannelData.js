/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: 'sampleChannelError',
        name: 'sampleChannelError',
        active: true,
        qualifier: {
            decision: 'ERROR'
        },
        target: 'sampleActionError'
    },

    record1: {
        code: 'sampleChannelSuccess',
        name: 'sampleChannelSuccess',
        active: true,
        qualifier: {
            decision: 'SUCCESS'
        },
        target: 'sampleActionSuccess'
    },

    record2: {
        code: "oneChannel",
        name: "oneChannel",
        active: true,
        qualifier: {
            decision: 'ONE'
        },
        target: 'sampleActionOne'
    },

    record3: {
        code: "twoChannel",
        name: "twoChannel",
        active: true,
        qualifier: {
            decision: 'TWO'
        },
        target: 'sampleActionTwo'
    },

    record4: {
        code: "threeChannel",
        name: "threeChannel",
        active: true,
        qualifier: {
            decision: 'THREE'
        },
        target: 'sampleActionThree'
    }


};