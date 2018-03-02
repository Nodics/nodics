/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    emsClient: {
        enabled: false,
        type: 'tibco', //tibco, activemq, rebbitmq, Kafka

        tibcoOptions: {
            url: "tcp://10.106.207.92:7222",
            username: "admin",
            password: "admin",
            queues: [{
                messageType: "stockData",
                inputQueue: "nodicsApplicationInput",
                outputQueue: "nodicsApplicationOutput",
                targetModule: 'emsClient'
            }]
        }
    }
};