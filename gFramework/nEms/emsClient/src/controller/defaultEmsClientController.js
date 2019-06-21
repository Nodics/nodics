/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    publish: function (request, callback) {
        request.payloads = request.httpRequest.body || {};
        if (callback) {
            return FACADE.DefaultEmsClientFacade.publish(request).then(success => {
                callback(null, success);
            }).catch(error => {
                this.LOG.error('While publishing and event: ', error);
                callback('While publishing and event: ' + error.toString());
            });
        } else {
            return FACADE.DefaultEmsClientFacade.publish(request);
        }
    },

    registerConsumers: function (request, callback) {
        request.consumers = request.httpRequest.body || {};
        if (callback) {
            return FACADE.DefaultEmsClientFacade.registerConsumers(request).then(success => {
                callback(null, success);
            }).catch(error => {
                this.LOG.error('While publishing and event: ', error);
                callback('While publishing and event: ' + error.toString());
            });
        } else {
            return FACADE.DefaultEmsClientFacade.registerConsumers(request);
        }
    },

    registerPublishers: function (request, callback) {
        request.publishers = request.httpRequest.body || {};
        if (callback) {
            return FACADE.DefaultEmsClientFacade.registerPublishers(request).then(success => {
                callback(null, success);
            }).catch(error => {
                this.LOG.error('While publishing and event: ', error);
                callback('While publishing and event: ' + error.toString());
            });
        } else {
            return FACADE.DefaultEmsClientFacade.registerPublishers(request);
        }
    }
};