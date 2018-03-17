/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    publish: function(request, callback) {
        if (!UTILS.isBlank(request.body)) {
            request.local = _.merge(request.local, request.body);
            return FACADE.EmsClientFacade.publish(request, callback);
        } else {
            this.LOG.error('   ERROR: Please validate your request, it is not a valid one');
            callback('ERROR: Please validate your request, it is not a valid one. Request should contain body: {queue:queueName, message:message}');
        }
    }
};