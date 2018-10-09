/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    retrieveEnterprise: function (enterpriseCode) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (UTILS.isBlank(enterpriseCode)) {
                reject('Enterprise Code is invalid or null');
            } else {
                _self.get({
                    tenant: 'default',
                    options: {
                        recursive: true
                    },
                    query: {
                        enterpriseCode: enterpriseCode
                    }
                }).then(enterprises => {
                    if (enterprises.length <= 0) {
                        reject('Invalid enterprise code');
                    } else {
                        resolve(enterprises[0]);
                    }
                }).catch(error => {
                    reject(error);
                });
            }
        });
    },
};