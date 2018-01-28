/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const bcrypt = require("bcrypt");

module.exports = {
    profile: {
        default: { // for all schema in user module
            testUserInterceptors: function(schema) {
                //console.log('%%% testUserInterceptors');
            }
        },
        employee: { // this will execute only for person schema
            encryptPasswordPreSave: function(schema, modelName) {
                schema.pre('save', function(next) {
                    SYSTEM.encryptPassword(this).then(document => {
                        next();
                    }).catch(error => {
                        next(error);
                    });
                });
            },

            encryptPasswordFindAndUpdate: function(schema, modelName) {
                schema.pre('findOneAndUpdate', function(next) {
                    let document = this._update.$set;
                    delete document.password;
                    next();
                });
            },

        },
        customer: { // this will execute only for person schema
            encryptPasswordPreSave: function(schema, modelName) {
                schema.pre('save', function(next) {
                    SYSTEM.encryptPassword(this).then(document => {
                        next();
                    }).catch(error => {
                        next(error);
                    });
                });
            },

            encryptPasswordFindAndUpdate: function(schema, modelName) {
                schema.pre('findOneAndUpdate', function(next) {
                    let document = this._update.$set;
                    delete document.password;
                    next();
                });
            },
        }

    }
};