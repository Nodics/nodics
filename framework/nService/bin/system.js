/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    prepareUrl: function(moduleName, secured) {
        if (secured) {
            return 'https://' +
                SYSTEM.getSecuredHost(moduleName) + ':' +
                SYSTEM.getSecuredPort(moduleName) + '/' +
                CONFIG.get('server').contextRoot + '/' +
                moduleName;
        } else {
            return 'http://' +
                SYSTEM.getHost(moduleName) + ':' +
                SYSTEM.getPort(moduleName) + '/' +
                CONFIG.get('server').contextRoot + '/' +
                moduleName;
        }
    },
    prepareClusterUrl: function(moduleName, clusterId, secured) {
        if (secured) {
            return 'https://' +
                SYSTEM.getClusterSecuredHost(moduleName, clusterId) + ':' +
                SYSTEM.getClusterSecuredPort(moduleName, clusterId) + '/' +
                CONFIG.get('server').contextRoot + '/' +
                moduleName;
        } else {
            return 'http://' +
                SYSTEM.getClusterHost(moduleName, clusterId) + ':' +
                SYSTEM.getClusterPort(moduleName, clusterId) + '/' +
                CONFIG.get('server').contextRoot + '/' +
                moduleName;
        }
    },

    prepareAbstractUrl: function(moduleName, secured) {
        if (secured) {
            return 'https://' +
                SYSTEM.getAbstractSecuredHost(moduleName) + ':' +
                SYSTEM.getAbstractSecuredPort(moduleName) + '/' +
                CONFIG.get('server').contextRoot + '/' +
                moduleName;
        } else {
            return 'http://' +
                SYSTEM.getAbstractHost(moduleName) + ':' +
                SYSTEM.getAbstractPort(moduleName) + '/' +
                CONFIG.get('server').contextRoot + '/' +
                moduleName;
        }
    }
};