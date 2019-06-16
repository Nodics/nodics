/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    generateAPIKey: function (request, responce) {
        return new Promise((resolve, reject) => {
            try {
                if (!UTILS.isBlank(request.model) && (request.tenant !== 'default' || request.model.loginId !== 'apiAdmin' || CONFIG.get('forceAPIKeyGenerate'))) {
                    request.model.apiKey = UTILS.generateHash((JSON.stringify(request.model) + (new Date()).getTime()));
                }
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }
};