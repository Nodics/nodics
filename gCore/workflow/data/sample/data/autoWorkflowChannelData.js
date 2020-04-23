/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: "autoOneChannel",
        name: "autoOneChannel",
        active: true,
        qualifier: {
            decision: 'AUTOONE'
        },
        target: 'autoActionOne'
    },
    record1: {
        code: "autoTwoChannel",
        name: "autoTwoChannel",
        active: true,
        qualifier: {
            decision: 'AUTOTWO'
        },
        target: 'autoActionTwo'
    },
    record2: {
        code: "autoThreeChannel",
        name: "autoThreeChannel",
        active: true,
        qualifier: {
            decision: 'AUTOTHREE'
        },
        target: 'autoActionThree'
    },
    record3: {
        code: 'autoSuccessChannel',
        name: 'autoSuccessChannel',
        active: true,
        qualifier: {
            decision: 'SUCCESS'
        },
        target: 'autoActionSuccess'
    }
};