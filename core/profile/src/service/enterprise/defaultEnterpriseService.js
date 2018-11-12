/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    retrieveEnterprise: function (enterpriseCode) {
        return new Promise((resolve, reject) => {
            if (UTILS.isBlank(enterpriseCode)) {
                reject({
                    success: false,
                    code: 'ERR_ENT_00000'
                });
            } else {
                this.get({
                    tenant: 'default',
                    options: {
                        recursive: true
                    },
                    query: {
                        code: enterpriseCode
                    }
                }).then(enterprises => {
                    if (enterprises.result.length !== 1) {
                        reject({
                            success: false,
                            code: 'ERR_ENT_00000'

                        });
                    } else {
                        resolve(enterprises.result[0]);
                    }
                }).catch(error => {
                    reject(error);
                });
            }
        });
    },
};