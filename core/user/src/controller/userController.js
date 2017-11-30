/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    options: {
        isNew: false
    },

    getFullName: function(requestContext, callback) {
        let request = {
            tenant: requestContext.tenant
        };
        if (requestContext.httpRequest) {
            FACADE.UserFacade.getFullName(request, callback);
        } else {
            console.log('   ERROR: Please validate your request, it is not a valid one');
            callback('ERROR: Please validate your request, it is not a valid one', null, request);
        }
    }
};