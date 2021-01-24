/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record0: {
        code: "defaultSuccessChannel",
        name: "defaultSuccessChannel",
        active: true,
        qualifier: {
            decision: 'SUCCESS'
        },
        target: 'defaultSuccessAction'
    },
    record1: {
        code: "defaultRejectChannel",
        name: "defaultRejectChannel",
        active: true,
        qualifier: {
            decision: 'REJECT'
        },
        target: 'defaultRejectAction'
    },
    record2: {
        code: "defaultErrorChannel",
        name: "defaultErrorChannel",
        active: true,
        qualifier: {
            decision: 'ERROR'
        },
        target: 'defaultErrorAction'
    },
    record3: {
        code: "defaultSplitEndChannel",
        name: "defaultSplitEndChannel",
        active: true,
        qualifier: {
            decision: 'SLIPTEND'
        },
        target: 'defaultSplitEndAction'
    }
};