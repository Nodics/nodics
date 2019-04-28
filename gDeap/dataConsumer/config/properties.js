/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    emsClient: {
        consumers: {
            kafkaInternalJsonTestDataConsumerQueue: {
                enabled: true,
                client: 'kafka',
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    header: {
                        schemaName: 'address',
                        operation: 'save'
                    }
                }
            },
            kafkaInternalXMLTestDataConsumerQueue: {
                enabled: true,
                client: 'kafka',
                options: {
                    messageHandler: 'xmlMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    header: {
                        schemaName: 'address',
                        operation: 'save'
                    }
                }
            },
            activeMQInternalJsonTestDataConsumerQueue: {
                enabled: true,
                client: 'activemq',
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    header: {
                        schemaName: 'address',
                        operation: 'save'
                    }
                }
            },
            activeMQInternalXMLTestDataConsumerQueue: {
                enabled: true,
                client: 'activemq',
                options: {
                    messageHandler: 'xmlMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    header: {
                        indexName: 'address',
                        operation: 'doSave'
                    }
                }
            }
        }
    }
};