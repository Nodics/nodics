/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const NodeCache = require("node-cache");

module.exports = {
    options: {
        isNew: true
    },

    initApiCache: function(options, moduleName) {
        return new Promise((resolve, reject) => {
            console.log('   INFO: Initializing local API Cache instance for module: ', moduleName);
            resolve(new NodeCache(options));
        });
    },

    initItemCache: function(options, moduleName) {
        return new Promise((resolve, reject) => {
            console.log('   INFO: Initializing local Item Cache instance for module: ', moduleName);
            resolve(new NodeCache(options));
        });
    },
};