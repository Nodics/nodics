/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    init: function() {
        console.log(' =>Initializing servers');
        let modules = NODICS.getModules();
        if (CONFIG.get('server').runAsSingleModule) {
            console.log('   INFO: Initializing single server for whole application. As CONFIG.server.runAsSingleModule set to true.');
            modules.default = {};
            modules.default.app = require('express')();
        } else {
            _.each(modules, function(value, moduleName) {
                if (value.metaData.publish) {
                    console.log('   INFO: Initializing server for module : ', moduleName);
                    value.app = require('express')();
                }
            });
        }
    }
};