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
                runOnNode: 'node0',
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    tenantRestricted: false, // Fix this queue to work for header.tenant, so client should not push data to other tenants
                    header: {
                        schemaName: 'internalData',
                        operation: 'saveAll',
                        tenant: 'default'
                    }
                }
            },
            kafkaInternalXMLSchemaDataConsumerQueue: {
                enabled: true,
                client: 'kafka',
                runOnNode: 'node0',
                options: {
                    messageHandler: 'xmlMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    tenantRestricted: false,
                    header: {
                        schemaName: 'internalData',
                        operation: 'saveAll',
                        tenant: 'default'
                    }
                }
            },

            // Kafka queues for putting data into ExternalSchema model
            kafkaExternalJsonSchemaDataConsumerQueue: {
                enabled: true,
                client: 'kafka',
                runOnNode: 'node0',
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'externalDataPushEvent',
                    tenantRestricted: false,
                    header: {
                        schemaName: 'externalData',
                        operation: 'saveAll',
                        tenant: 'default'
                    }
                }
            },
            kafkaExternalXMLSchemaDataConsumerQueue: {
                enabled: true,
                client: 'kafka',
                runOnNode: 'node0',
                options: {
                    messageHandler: 'xmlMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'externalDataPushEvent',
                    tenantRestricted: false,
                    header: {
                        schemaName: 'externalData',
                        operation: 'saveAll',
                        tenant: 'default'
                    }
                }
            },

            // Kafka queues for putting data into InternalSearch model
            kafkaInternalJsonSearchDataConsumerQueue: {
                enabled: true,
                client: 'kafka',
                runOnNode: 'node0',
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    tenantRestricted: false,
                    header: {
                        indexName: 'internalData',
                        operation: 'doSave',
                        tenant: 'default'
                    }
                }
            },
            kafkaInternalXMLSearchDataConsumerQueue: {
                enabled: true,
                client: 'kafka',
                runOnNode: 'node0',
                options: {
                    messageHandler: 'xmlMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    tenantRestricted: false,
                    header: {
                        indexName: 'internalData',
                        operation: 'doSave',
                        tenant: 'default'
                    }
                }
            },

            // Kafka queues for putting data into ExternalSearch model
            kafkaExternalJsonSearchDataConsumerQueue: {
                enabled: true,
                client: 'kafka',
                runOnNode: 'node0',
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'externalDataPushEvent',
                    tenantRestricted: false,
                    header: {
                        indexName: 'externalData',
                        operation: 'doSave',
                        tenant: 'default'
                    }
                }
            },
            kafkaExternalXMLSearchDataConsumerQueue: {
                enabled: true,
                client: 'kafka',
                runOnNode: 'node0',
                options: {
                    messageHandler: 'xmlMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'externalDataPushEvent',
                    tenantRestricted: false,
                    header: {
                        indexName: 'externalData',
                        operation: 'doSave',
                        tenant: 'default'
                    }
                }
            },

            // Active MQ queues for putting data into InternalSchema model
            activeMQInternalJsonSchemaDataConsumerQueue: {
                enabled: true,
                client: 'activemq',
                runOnNode: 'node0',
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    tenantRestricted: false,
                    header: {
                        schemaName: 'internalData',
                        operation: 'saveAll',
                        tenant: 'default'
                    }
                }
            },
            activeMQInternalXMLSchemaDataConsumerQueue: {
                enabled: true,
                client: 'activemq',
                runOnNode: 'node0',
                options: {
                    messageHandler: 'xmlMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    tenantRestricted: false,
                    header: {
                        schemaName: 'internalData',
                        operation: 'saveAll',
                        tenant: 'default'
                    }
                }
            },

            // Active MQ queues for putting data into ExternalSchema model
            activeMQExternalJsonSchemaDataConsumerQueue: {
                enabled: true,
                client: 'activemq',
                runOnNode: 'node0',
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'externalDataPushEvent',
                    tenantRestricted: false,
                    header: {
                        schemaName: 'externalData',
                        operation: 'saveAll',
                        tenant: 'default'
                    }
                }
            },
            activeMQExternalXMLSchemaDataConsumerQueue: {
                enabled: true,
                client: 'activemq',
                runOnNode: 'node0',
                options: {
                    messageHandler: 'xmlMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'externalDataPushEvent',
                    tenantRestricted: false,
                    header: {
                        schemaName: 'externalData',
                        operation: 'saveAll',
                        tenant: 'default'
                    }
                }
            },

            // Active MQ queues for putting data into InternalSearch model
            activeMQInternalJsonSearchDataConsumerQueue: {
                enabled: true,
                client: 'activemq',
                runOnNode: 'node0',
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    tenantRestricted: false,
                    header: {
                        indexName: 'internalData',
                        operation: 'doSave',
                        tenant: 'default'
                    }
                }
            },
            activeMQInternalXMLSearchDataConsumerQueue: {
                enabled: true,
                client: 'activemq',
                runOnNode: 'node0',
                options: {
                    messageHandler: 'xmlMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    tenantRestricted: false,
                    header: {
                        indexName: 'internalData',
                        operation: 'doSave',
                        tenant: 'default'
                    }
                }
            },

            // Active MQ queues for putting data into ExternalSearch model
            activeMQExternalJsonSearchDataConsumerQueue: {
                enabled: true,
                client: 'activemq',
                runOnNode: 'node0',
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'externalDataPushEvent',
                    tenantRestricted: false,
                    header: {
                        indexName: 'externalData',
                        operation: 'doSave',
                        tenant: 'default'
                    }
                }
            },
            activeMQExternalXMLSearchDataConsumerQueue: {
                enabled: true,
                client: 'activemq',
                runOnNode: 'node0',
                options: {
                    messageHandler: 'xmlMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'externalDataPushEvent',
                    tenantRestricted: false,
                    header: {
                        indexName: 'externalData',
                        operation: 'doSave',
                        tenant: 'default'
                    }
                }
            }
        }
    }
};