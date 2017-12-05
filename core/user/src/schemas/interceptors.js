/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    user: {
        default: { // for all schema in user module
            testUserInterceptors: function(schema) {
                console.log('%%% testUserInterceptors');
            }
        },
        person: { // this will execute only for person schema
            testPersonInterceptors: function(schema) {
                console.log('%%% testPersonInterceptors');
            }
        }

    }
};