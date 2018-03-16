/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    init: function() {
        let emsConfig = CONFIG.get('emsClient');
        if (emsConfig.enabled && emsConfig.type) {
            SERVICE[emsConfig.type.toUpperCaseFirstChar() + 'ClientService'].init(emsConfig[emsConfig.type]).then(success => {
                console.log('   INFO: Successfully established connection with : ', emsConfig.type);
            }).catch(error => {
                console.log(error);
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
    publish: function(request, callback) {
        let input = request.local || request;
        let emsConfig = CONFIG.get('emsClient');
        if (callback) {
            SERVICE[emsConfig.type.toUpperCaseFirstChar() + 'ClientService'].publish(input).then(success => {
                callback(null, 'Message published Successfully');
            }).catch(error => {
                callback(error);
            });
        } else {
            return SERVICE[emsConfig.type.toUpperCaseFirstChar() + 'ClientService'].publish(input);
        }
    }
};