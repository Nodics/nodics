/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    init: function () {
        let _self = this;
        let emsConfig = CONFIG.get('emsClient');
        if (emsConfig.enabled && emsConfig.type) {
            let conf = emsConfig[emsConfig.type];
            SERVICE[conf.handler].init(conf).then(success => {
                _self.LOG.debug('Successfully established connection with : ', emsConfig.type);
            }).catch(error => {
                _self.LOG.error(error);
            });
        }
    },

    /*
        let message = {
            topic: payload.queue,
            messages: payload.messages,
            partition: payload.partition || 0
        };
    */
    publish: function (request, callback) {
        let input = request.local || request;
        let emsConfig = CONFIG.get('emsClient');
        let conf = emsConfig[emsConfig.type];
        if (input.payloads instanceof Array) {
            let allPayloads = [];
            input.payloads.forEach(element => {
                allPayloads.push(SERVICE[conf.handler].publish(element));
            });
            if (allPayloads.length > 0) {
                Promise.all(allPayloads).then(success => {
                    if (callback) {
                        callback(null, 'Message published Successfully');
                    } else {
                        return Promise.resolve('Message published Successfully');
                    }
                }).catch(error => {
                    if (callback) {
                        callback(error);
                    } else {
                        return Promise.reject(error);
                    }
                });
            }
        } else {
            if (callback) {
                SERVICE[conf.handler].publish(input.payloads).then(success => {
                    callback(null, 'Message published Successfully');
                }).catch(error => {
                    callback(error);
                });
            } else {
                return SERVICE[conf.handler].publish(input.payloads);
            }
        }

    }
};