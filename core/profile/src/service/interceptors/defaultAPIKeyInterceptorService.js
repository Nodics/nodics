/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    generateAPIKey: function (options) {
        return new Promise((resolve, reject) => {
            try {
                if (!options.model.apiKey) {
                    let key = options.model.enterpriseCode + options.model.code + (new Date()).getTime();
                    options.model.apiKey = SYSTEM.generateHash(key);
                }
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }
};