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
            // Kafka queues for putting data into InternalSchema model
            kafkaInternalJsonSchemaDataConsumerQueue: {
                enabled: true,
                client: 'kafka',
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    header: {
                        schemaName: 'inetrnalData',
                        operation: 'save'
                    }
                }
            },
            kafkaInternalXMLSchemaDataConsumerQueue: {
                enabled: true,
                client: 'kafka',
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    header: {
                        schemaName: 'inetrnalData',
                        operation: 'save'
                    }
                }
            },

            // Kafka queues for putting data into ExternalSchema model
            kafkaExternalJsonSchemaDataConsumerQueue: {
                enabled: true,
                client: 'kafka',
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    header: {
                        schemaName: 'externalData',
                        operation: 'save'
                    }
                }
            },
            kafkaExternalXMLSchemaDataConsumerQueue: {
                enabled: true,
                client: 'kafka',
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    header: {
                        schemaName: 'externalData',
                        operation: 'save'
                    }
                }
            },

            // Kafka queues for putting data into InternalSearch model
            kafkaInternalJsonSearchDataConsumerQueue: {
                enabled: true,
                client: 'kafka',
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    header: {
                        indexName: 'inetrnalData',
                        operation: 'doSave'
                    }
                }
            },
            kafkaInternalXMLSearchDataConsumerQueue: {
                enabled: true,
                client: 'kafka',
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    header: {
                        indexName: 'inetrnalData',
                        operation: 'doSave'
                    }
                }
            },

            // Kafka queues for putting data into ExternalSearch model
            kafkaExternalJsonSearchDataConsumerQueue: {
                enabled: true,
                client: 'kafka',
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    header: {
                        indexName: 'externalData',
                        operation: 'doSave'
                    }
                }
            },
            kafkaExternalXMLSearchDataConsumerQueue: {
                enabled: true,
                client: 'kafka',
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    header: {
                        indexName: 'externalData',
                        operation: 'doSave'
                    }
                }
            },

            // Active MQ queues for putting data into InternalSchema model
            activeMQInternalJsonSchemaDataConsumerQueue: {
                enabled: true,
                client: 'activemq',
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    header: {
                        schemaName: 'inetrnalData',
                        operation: 'save'
                    }
                }
            },
            activeMQInternalXMLSchemaDataConsumerQueue: {
                enabled: true,
                client: 'activemq',
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    header: {
                        schemaName: 'inetrnalData',
                        operation: 'save'
                    }
                }
            },

            // Active MQ queues for putting data into ExternalSchema model
            activeMQExternalJsonSchemaDataConsumerQueue: {
                enabled: true,
                client: 'activemq',
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    header: {
                        schemaName: 'externalData',
                        operation: 'save'
                    }
                }
            },
            activeMQExternalXMLSchemaDataConsumerQueue: {
                enabled: true,
                client: 'activemq',
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    header: {
                        schemaName: 'externalData',
                        operation: 'save'
                    }
                }
            },

            // Active MQ queues for putting data into InternalSearch model
            activeMQInternalJsonSearchDataConsumerQueue: {
                enabled: true,
                client: 'activemq',
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    header: {
                        indexName: 'inetrnalData',
                        operation: 'doSave'
                    }
                }
            },
            activeMQInternalXMLSearchDataConsumerQueue: {
                enabled: true,
                client: 'activemq',
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    header: {
                        indexName: 'inetrnalData',
                        operation: 'doSave'
                    }
                }
            },

            // Active MQ queues for putting data into ExternalSearch model
            activeMQExternalJsonSearchDataConsumerQueue: {
                enabled: true,
                client: 'activemq',
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    header: {
                        indexName: 'externalData',
                        operation: 'doSave'
                    }
                }
            },
            activeMQExternalXMLSearchDataConsumerQueue: {
                enabled: true,
                client: 'activemq',
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    header: {
                        indexName: 'externalData',
                        operation: 'doSave'
                    }
                }
            }
        }
    }
};