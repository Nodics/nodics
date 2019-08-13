/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    publish: function (request) {
        return SERVICE.DefaultEmsClientService.publish(request);
    },

    registerConsumers: function (request) {
        return SERVICE.DefaultEmsClientService.registerConsumers(request);
    },

    registerPublishers: function (request) {
        return SERVICE.DefaultEmsClientService.registerPublishers(request);
    },

    closeConsumers: function (request) {
        return SERVICE.DefaultEmsClientService.closeConsumers(request);
    },

    closePublishers: function (request) {
        return SERVICE.DefaultEmsClientService.closePublishers(request);
    }
};