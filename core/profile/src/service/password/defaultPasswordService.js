/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    findPassword: function (input) {
        let _self = this;
        return new Promise((resolve, reject) => {
            console.log('  11');
            _self.get({
                tenant: input.tenant,
                options: {
                    query: {
                        loginId: input.loginId,
                        enterpriseCode: input.enterpriseCode
                    }
                }
            }).then(passwords => {
                console.log('  12');
                if (passwords.length <= 0) {
                    console.log('  13');
                    reject('Invalid password detail');
                } else {
                    console.log('  15');
                    resolve(passwords[0]);
                }
            }).catch(error => {
                console.log('  16');
                reject(error);
            });
        });
    }

};