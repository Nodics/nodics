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
            schema.pre('save', function(next) {
                if (NODICS.isNTestRunning()) {
                    throw new Error('Save operation not allowed, while running N-Test cases');
                }
                if (next && typeof next === "function") {
                    next();
                }
            });
        },

        preUpdateInterceptor: function(schema) {
            schema.pre('update', function(next) {
                if (NODICS.isNTestRunning()) {
                    throw new Error('Update operation not allowed, while running N-Test cases');
                }
                if (next && typeof next === "function") {
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