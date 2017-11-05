/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    default: {
        preSaveInterceptor: function(schema) {
            //console.log('!!!! PreSave ');
            schema.pre('save', function(next) {
                //console.log('%%% This is custome PreSave methods');
                if (next && typeof next === "function") {
                    //console.log('function1111111111111111');
                    next();
                }
            });
        },

        preSave1Interceptor: function(schema) {
            //console.log('!!!! PreSave ');
            schema.pre('save', function(next) {
                //console.log('%%% This is custome Pre1Save methods');
                if (next && typeof next === "function") {
                    //console.log('function222222222222222');
                    next();
                }
            });
        },

        postSaveInterceptor: function(schema) {
            //console.log('!!!! PostSave ');
            schema.post('save', function(next) {
                //console.log('%%% This is custome PostSave methods');
                if (next && typeof next === "function") {
                    next();
                }
            });
        }
    }
}