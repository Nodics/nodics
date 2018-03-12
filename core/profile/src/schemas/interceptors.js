/*
    Nodics - Enterprice Micro-Services Management Framework

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
        password: { // this will execute only for person schema
            encryptPasswordPreSave: function(schema, modelName) {
                schema.pre('save', function(next) {
                    let doc = this;
                    SYSTEM.encryptPassword(doc).then(document => {
                        next();
                    }).catch(error => {
                        next(error);
                    });
                });
            },
            encryptPasswordPreUpdate: function(schema, modelName) {
                schema.pre('update', function(next) {
                    let doc = this._update.$set;
                    SYSTEM.encryptPassword(doc).then(document => {
                        next();
                    }).catch(error => {
                        next(error);
                    });
                });
            },
            encryptPasswordPreSaveOrUpdate: function(schema, modelName) {
                schema.pre('findOneAndUpdate', function(next) {
                    let doc = this._update.$set;
                    SYSTEM.encryptPassword(doc).then(document => {
                        next();
                    }).catch(error => {
                        next(error);
                    });
                });
            }
        }
    }
};