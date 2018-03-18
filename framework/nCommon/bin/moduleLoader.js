/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const dao = require('./loaders/daoLoader');
const service = require('./loaders/serviceLoader');
const processDefinition = require('./loaders/processDefinitionLoader');
const facade = require('./loaders/facadeLoader');
const controller = require('./loaders/controllerLoader');
const router = require('./loaders/routerLoader');
const test = require('./loaders/testLoader');
const data = require('./loaders/dataLoader');

module.exports = {
    init: function() {
        SYSTEM.LOG.info('Staring process to load Modules');
        let _self = this;
        let moduleIndex = CONFIG.get('moduleIndex');
        Object.keys(moduleIndex).forEach(function(key) {
            var value = moduleIndex[key][0];
            _self.loadModule(value);
        });
    },

    loadModule: function(module) {
        SYSTEM.LOG.debug('Staring process for module : ', module.name);
        dao.loadDao(module);
        service.loadServices(module);
        processDefinition.loadProcessDefinition(module);
        facade.loadFacades(module);
        controller.loadControllers(module);
        data.loadData(module);
        test.loadTest(module);

        let moduleFile = require(module.path + '/nodics.js');
        if (moduleFile.init) {
            moduleFile.init();
        }
    }
};