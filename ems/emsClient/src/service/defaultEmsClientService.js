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
    publish: function (request) {
        return new Promise((resolve, reject) => {
            let emsConfig = CONFIG.get('emsClient');
            let conf = emsConfig[emsConfig.type];
            if (request.payloads instanceof Array && request.payloads.length > 0) {
                let allPayloads = [];
                request.payloads.forEach(element => {
                    allPayloads.push(SERVICE[conf.handler].publish(element));
                });
                if (allPayloads.length > 0) {
                    Promise.all(allPayloads).then(success => {
                        resolve(success);
                    }).catch(error => {
                        reject(error);
                    });
                }
            } else {
                SERVICE[conf.handler].publish(request.payloads).then(success => {
                    resolve(success);
                }).catch(error => {
                    reject(error);
                });
            }
        });
    }
};