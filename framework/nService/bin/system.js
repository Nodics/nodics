/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

let requestPromise = require('request-promise');
const request = require('request');

module.exports = {
    prepareConnectionUrl: function(moduleName) {
        let moduleServerConfiguration = CONFIG.get('server')[moduleName];
        if (!moduleServerConfiguration || CONFIG.get('server').runAsSingleModule) {
            moduleServerConfiguration = CONFIG.get('server').default;
        }
        return 'http://' + moduleServerConfiguration.httpServer + ':' + moduleServerConfiguration.httpPort + '/' + CONFIG.get('server').contextRoot;
    },

    prepareSecureConnectionUrl: function(moduleName) {
        let moduleServerConfiguration = CONFIG.get('server')[moduleName];
        if (!moduleServerConfiguration || CONFIG.get('server').runAsSingleModule) {
            moduleServerConfiguration = CONFIG.get('server').default;
        }
        return 'https://' + moduleServerConfiguration.httpsServer + ':' + moduleServerConfiguration.httpsPort + '/' + CONFIG.get('server').contextRoot;
    },
};