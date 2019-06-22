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
                    tenantRestricted: true, // Fix this queue to work for header.tenant, so client should not push data to other tenants
                    header: {
                        schemaName: 'internalData',
                        operation: 'save',
                        tenant: 'default'
                    }
                }
            },
            kafkaInternalXMLSchemaDataConsumerQueue: {
                enabled: true,
                client: 'kafka',
                options: {
                    messageHandler: 'xmlMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    tenantRestricted: true,
                    header: {
                        schemaName: 'internalData',
                        operation: 'save',
                        tenant: 'default'
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
                    eventName: 'externalDataPushEvent',
                    tenantRestricted: true,
                    header: {
                        schemaName: 'externalData',
                        operation: 'save',
                        tenant: 'default'
                    }
                }
            },
            kafkaExternalXMLSchemaDataConsumerQueue: {
                enabled: true,
                client: 'kafka',
                options: {
                    messageHandler: 'xmlMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'externalDataPushEvent',
                    tenantRestricted: true,
                    header: {
                        schemaName: 'externalData',
                        operation: 'save',
                        tenant: 'default'
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
                    tenantRestricted: true,
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
                options: {
                    messageHandler: 'xmlMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    tenantRestricted: true,
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
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'externalDataPushEvent',
                    tenantRestricted: true,
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
                options: {
                    messageHandler: 'xmlMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'externalDataPushEvent',
                    tenantRestricted: true,
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
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    tenantRestricted: true,
                    header: {
                        schemaName: 'internalData',
                        operation: 'save',
                        tenant: 'default'
                    }
                }
            },
            activeMQInternalXMLSchemaDataConsumerQueue: {
                enabled: true,
                client: 'activemq',
                options: {
                    messageHandler: 'xmlMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    tenantRestricted: true,
                    header: {
                        schemaName: 'internalData',
                        operation: 'save',
                        tenant: 'default'
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
                    eventName: 'externalDataPushEvent',
                    tenantRestricted: true,
                    header: {
                        schemaName: 'externalData',
                        operation: 'save',
                        tenant: 'default'
                    }
                }
            },
            activeMQExternalXMLSchemaDataConsumerQueue: {
                enabled: true,
                client: 'activemq',
                options: {
                    messageHandler: 'xmlMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'externalDataPushEvent',
                    tenantRestricted: true,
                    header: {
                        schemaName: 'externalData',
                        operation: 'save',
                        tenant: 'default'
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
                    tenantRestricted: true,
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
                options: {
                    messageHandler: 'xmlMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'internalDataPushEvent',
                    tenantRestricted: true,
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
                options: {
                    messageHandler: 'jsonMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'externalDataPushEvent',
                    tenantRestricted: true,
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
                options: {
                    messageHandler: 'xmlMessageHandler',
                    target: 'dataConsumer',
                    eventName: 'externalDataPushEvent',
                    tenantRestricted: true,
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