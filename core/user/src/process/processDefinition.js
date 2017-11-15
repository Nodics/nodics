/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    calculationProcess: {
        startNode: "node1",
        //handleError: 'someProcess', // if this is not defined, handle OOTB
        hardStop: false, //default value is false
        nodes: {
            node1: {
                type: 'function',
                process: 'SERVICE.UserService.processNodeFirst',
                success: 'node2',
                failure: 'SERVICE.UserService.errorEnd'
            },
            node2: {
                type: 'process',
                process: 'sampleProcess',
                success: 'node3',
                failure: 'SERVICE.UserService.errorEnd'
            },
            node3: {
                type: 'function',
                process: 'SERVICE.UserService.processNodeThird',
                success: 'successEnd', // End if value is successEnd
                failure: 'failureEnd' // End if value is failureEnd
            }
        }
    },

    sampleProcess: {
        startNode: "node1",
        //errorProcess: 'someProcess', // if this is not defined, handle OOTB
        nodes: {
            node1: {
                type: 'function',
                process: 'SERVICE.UserService.process1NodeThird',
                success: 'node2',
                failure: 'SERVICE.UserService.errorEnd'
            },
            node2: {
                type: 'function',
                process: 'SERVICE.UserService.process1NodeSecond',
                success: 'successEnd',
                failure: 'failureEnd'
            }
        }
    }
};