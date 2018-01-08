/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const initServers = require('./bin/initializeServers');
const serverConfig = require('./bin/loadServerConfiguration');
const registerRouter = require('./bin/registerRouter');

module.exports = {
    init: function() {

    },
    loadRouter: function() {
        console.log('=> Staring servers initialization process');
        initServers.init();
        serverConfig.init();
        registerRouter.init();
        //registerRouter.init();
    }
};