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
            SERVICE[emsConfig.type.toUpperCaseFirstChar() + 'ClientService'].init(emsConfig[emsConfig.type + 'Options']).then(success => {
                console.log('   INFO: Successfully established connect with : ', emsConfig.type);
            }).catch(error => {
                console.log(error);
            });
        }
    },

    publish: function(input, callback) {
        let emsConfig = CONFIG.get('emsClient');
        if (callback) {
            SERVICE[emsConfig.type.toUpperCaseFirstChar() + 'ClientService'].publish(input.queue, input.message).then(success => {
                callback(null, 'Message published Successfully');
            }).catch(error => {
                callback(error);
            });
        } else {
            return SERVICE[emsConfig.type.toUpperCaseFirstChar() + 'ClientService'].publish(input.queue, input.message);
        }
    },

    consume: function(input, callback) {
        let emsConfig = CONFIG.get('emsClient');
        if (callback) {
            SERVICE[emsConfig.type.toUpperCaseFirstChar() + 'ClientService'].consume(input).then(success => {
                callback(null, 'Message consumed Successfully');
            }).catch(error => {
                callback(error);
            });
        } else {
            return SERVICE[emsConfig.type.toUpperCaseFirstChar() + 'ClientService'].publish(input);
        }
    }
};