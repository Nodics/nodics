/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    defaultProcess: {
        nodes: {
            successEnd: {
                name: 'successEnd',
                type: 'function',
                process: 'PROCESS.handleSucessEnd'
            },
            failureEnd: {
                name: 'failureEnd',
                type: 'function',
                process: 'PROCESS.handleFailureEnd'
            },
            handleError: {
                name: 'handleError',
                type: 'function',
                process: 'PROCESS.handleErrorEnd'
            }
        }
    }
};