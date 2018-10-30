/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    findByLoginId: function (request) {
        return new Promise((resolve, reject) => {
            this.get({
                tenant: request.tenant,
                query: {
                    loginId: request.loginId,
                    enterpriseCode: request.enterpriseCode
                }
            }).then(customers => {
                if (customers.length <= 0) {
                    reject('Invalid login id');
                } else {
                    resolve(customers[0]);
                }
            }).catch(error => {
                reject(error);
            });
        });
    },
};