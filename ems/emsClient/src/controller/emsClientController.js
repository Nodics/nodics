/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    publish: function(requestContext, callback) {
        if (!UTILS.isBlank(requestContext.httpRequest.body)) {
            let request = requestContext.httpRequest.body;
            request.tenant = requestContext.tenant;
            request.enterpriseCode = requestContext.enterpriseCode;
            request.authToken = requestContext.authToken;
            return FACADE.EmsClientFacade.publish(request, callback);
        } else {
            console.log('   ERROR: Please validate your request, it is not a valid one');
            callback('ERROR: Please validate your request, it is not a valid one. Request should contain body: {queue:queueName, message:message}');
        }
    }
};