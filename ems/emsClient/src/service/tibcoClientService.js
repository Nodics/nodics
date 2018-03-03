/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const fs = require("fs");
const path = require("path");
const java = require("java");

module.exports = {

    publisherPool: {},
    consumerPool: {},

    init: function(config) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (!config.options) {
                reject('ERROR: Tibco configuration is not valid');
            }
            let baseDir = path.join(__dirname, '../');
            let libPath = baseDir + 'ext/lib';

            let dependencies = fs.readdirSync(libPath);
            dependencies.forEach(function(dependency) {
                console.log('   INFO: Setting classpath for : ', libPath + "/" + dependency);
                java.classpath.push(libPath + "/" + dependency);
            });
            console.log('   INFO: Setting classpath for : ', baseDir + '/ext/bin');
            java.classpath.push(baseDir + '/ext/bin');
            try {
                java.newInstance("com.tibco.tibjms.TibjmsConnectionFactory", config.options.url, function(error, tibcoConnectionFactory) {
                    if (error) {
                        reject('  ERROR: while creating tibco connection factory');
                    } else {
                        java.newInstance("com.nodics.tibco.connection.ConnectionFactory",
                            config.options.username,
                            config.options.password,
                            tibcoConnectionFactory,
                            function(err, connectionFactory) {
                                if (error) {
                                    reject('  ERROR: while creating tibco connection : ', config.options.url);
                                } else {
                                    console.log('   INFO: Connection stablished with tibco ems');
                                    let publishers = [];
                                    let consumers = [];
                                    config.queues.forEach(queue => {
                                        if (queue.inputQueue) {
                                            publishers.push(_self.createPublisher(connectionFactory, queue));
                                        }
                                        if (queue.outputQueue) {
                                            consumers.push(_self.createConsumer(connectionFactory, queue));
                                        }
                                    });
                                    let allPrimise = publishers.concat(consumers);
                                    if (allPrimise.length > 0) {
                                        Promise.all(allPrimise).then(success => {
                                            resolve(true);
                                        }).catch(error => {
                                            reject(error);
                                        });
                                    } else {
                                        reject('   ERROR: could not found any queue information');
                                    }
                                }
                            });
                    }
                });
            } catch (err) {
                reject('  ERROR: while creating tibco connection : ', config.options.url);
            }
        });


    },

    createPublisher: function(connectionFactory, queue) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                java.newInstance("com.nodics.tibco.messaging.TibcoPublisherImpl",
                    connectionFactory,
                    queue.messageType,
                    queue.inputQueue,
                    function(error, publisher) {
                        if (error) {
                            console.log(error);
                            reject('  ERROR: while creating publisher for queue : ' + queue.inputQueue);
                        } else {
                            try {
                                publisher.initSync();
                                _self.publisherPool[queue.inputQueue] = publisher;
                                resolve(true);
                            } catch (errorInit) {
                                reject('  ERROR: while creating publisher for queue : ' + queue.inputQueue);
                            }
                        }
                    });
            } catch (error) {
                reject('  ERROR: while creating publisher for queue : ' + queue.inputQueue);
            }
        });
    },

    createConsumer: function(connectionFactory, queue) {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let evantUrl = SYSTEM.prepareConnectionUrl('nems') + '/event/push';
                java.newInstance("com.nodics.tibco.messaging.TibcoConsumerImpl",
                    connectionFactory,
                    queue.outputQueue,
                    queue.targetModule,
                    evantUrl,
                    function(error, consumer) {
                        if (error) {
                            console.log(error);
                            reject('  ERROR: while creating consumer for queue : ' + queue.outputQueue);
                        } else {
                            try {
                                consumer.initSync();
                                _self.consumerPool[queue.outputQueue] = consumer;
                                resolve(true);
                            } catch (errorInit) {
                                reject('  ERROR: while creating consumer for queue : ' + queue.inputQueue);
                            }
                        }
                    });
            } catch (error) {
                reject('  ERROR: while creating consumer for queue : ' + queue.outputQueue);
            }
        });
    },

    publish: function(queueName, message) {
        return new Promise((resolve, reject) => {
            let publisher = this.publisherPool[queueName];
            if (publisher) {
                try {
                    publisher.publishSync(message);
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            } else {
                reject('   ERROR: Either queue name : ' + queueName + ' is not valid or could not created publisher');
            }
        });
    }
};