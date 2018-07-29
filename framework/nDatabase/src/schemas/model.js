/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    default: {
        defineDefaultFind: function (model, rawSchema) {
            model.findItem = function (input) {
                console.log('Static function for: ', model.schemaName);
            }
        },

        defineDefaultGet: function (model, rawSchema) {
            model.get = function (input) {
                console.log('Static function for: ', model.schemaName);
            }
        },

        defineDefaultSave: function (model, rawSchema) {
            model.save = function (input) {
                console.log('Static function for: ', model.schemaName);
            }
        },

        defineDefaultUpdate: function (model, rawSchema) {
            model.update = function (input) {
                console.log('Static function for: ', model.schemaName);
            }
        },

        defineDefaultRemove: function (model, rawSchema) {
            model.remove = function (input) {
                console.log('Static function for: ', model.schemaName);
            }
        },

        defineDefaultSaveOrUpdate: function (model, rawSchema) {
            model.saveOrUpdate = function (input) {
                return new Promise((resolve, reject) => {
                    console.log('Static function for: ', model.schemaName);
                    resolve(true);
                });
            }
        }
    }
};