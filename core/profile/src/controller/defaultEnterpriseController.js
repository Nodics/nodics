/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    getEnterprise: function (request, callback) {
        let enterpriseCode = request.local.enterpriseCode;
        if (UTILS.isBlank(enterpriseCode)) {
            callback('Invalid enterprise code');
        } else {
            request.local.tenant = 'default';
            request.local.query = {
                enterpriseCode: enterpriseCode
            };
            FACADE.DefaultEnterpriseFacade.get(request, callback);
        }
    }
};