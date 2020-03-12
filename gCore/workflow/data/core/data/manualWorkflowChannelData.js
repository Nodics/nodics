/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    record0: {
        code: "manualOneChannel",
        name: "manualOneChannel",
        active: true,
        qualifier: {
            decision: 'MONE'
        },
        target: 'manualActionOne'
    },
    record1: {
        code: "manualTwoChannel",
        name: "manualTwoChannel",
        active: true,
        qualifier: {
            decision: 'MTWO'
        },
        target: 'manualActionTwo'
    },
    record2: {
        code: "manualThreeChannel",
        name: "manualThreeChannel",
        active: true,
        qualifier: {
            decision: 'MTHREE'
        },
        target: 'manualActionThree'
    },
    record3: {
        code: 'manualSuccessChannel',
        name: 'manualSuccessChannel',
        active: true,
        qualifier: {
            decision: 'SUCCESS'
        },
        target: 'manualActionSuccess'
    }
};