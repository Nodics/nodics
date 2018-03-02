/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const config = require('./nConfig');
const common = require('./nCommon');
const db = require('./nDatabase');
const dao = require('./nDao');
const services = require('./nService');
const process = require('./nProcess');
const event = require('./nEvent');
const facades = require('./nFacade');
const controllers = require('./nController');
const router = require('./nRouter');
const test = require('./nTest');

module.exports = {
    init: function() {
        ////
    },

    initFrameworkExecute: function(options) {
        config.loadConfig(options);
        SYSTEM.executePreScripts();
        common.loadCommon();
        db.loadDatabase();
        dao.loadDao();
        services.loadService();
        process.loadProcess();
        facades.loadFacade();
        controllers.loadController();
        SYSTEM.loadModules();
        event.loadListeners();
        router.loadRouter();
        SYSTEM.executePostScripts();
    },

    startServers: function() {
        SYSTEM.startServers();
        NODICS.setServerState('started');
    },

    initTestRuner: function() {
        test.runTest();
    },

    startNodics: function(options) {
        this.initFrameworkExecute(options);
        this.startServers();
        this.initTestRuner();
    }
};