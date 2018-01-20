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

    getEnterprise: function(processRequest, callback) {
        console.log(' ------- get Enterprise : ', processRequest.enterpriseCode);
        if (UTILS.isBlank(processRequest.enterpriseCode)) {
            callback('Invalid enterprise code');
        } else {
            let request = {
                tenant: 'default'
            };
            request.options = {
                query: {
                    enterpriseCode: processRequest.enterpriseCode
                }
            };
            FACADE.EnterpriseFacade.get(request, callback);
        }
    }
};