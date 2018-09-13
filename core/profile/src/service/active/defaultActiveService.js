/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    findActive: function (input) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.get({
                tenant: input.tenant,
                options: {
                    query: {
                        $and: [{
                            loginId: input.loginId,
                        }, {
                            personId: input._id
                        }]
                    }
                }
            }).then(actives => {
                if (actives.length <= 0) {
                    resolve({
                        code: input.loginId,
                        loginId: input.loginId,
                        personId: input._id,
                        attempts: 0,
                        active: true
                    });
                } else {
                    resolve(actives[0]);
                }
            }).catch(error => {
                resolve({
                    loginId: input.loginId,
                    personId: input._id,
                    attempts: 0,
                    active: true
                });
            });
        });
    },

};