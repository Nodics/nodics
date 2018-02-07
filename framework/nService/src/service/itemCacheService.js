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

    initCache: function(moduleObject, moduleName, cacheConfig) {
        return new Promise((resolve, reject) => {
            if (!moduleObject.itemCache &&
                moduleObject.rawSchema &&
                cacheConfig.itemCache.enabled) {
                if (cacheConfig.itemCache.engine === 'local') {
                    console.log('   INFO: Initializing local Item Cache instance for module: ', moduleName);
                    moduleObject.itemCache = {
                        type: cacheConfig.itemCache.engine,
                        client: new NodeCache(cacheConfig.localOptions)
                    };
                    resolve(true);
                } else {

                }
            } else {
                console.log('   INFO: Cache not enabled for : ', moduleName);
                resolve(false);
            }
        });
    }
};