/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    prepareConnectionUrl: function(moduleName) {
        return 'http://' +
            SYSTEM.getAbstractHost(moduleName) + ':' +
            SYSTEM.getAbstractPort(moduleName) + '/' +
            CONFIG.get('server').contextRoot + '/' +
            moduleName;
    },

    prepareSecureConnectionUrl: function(moduleName) {
        return 'http://' +
            SYSTEM.getAbstractSecuredHost(moduleName) + ':' +
            SYSTEM.getAbstractSecuredPort(moduleName) + '/' +
            CONFIG.get('server').contextRoot + '/' +
            moduleName;
    }
};