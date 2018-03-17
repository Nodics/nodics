/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    loadControllers: function(module) {
        SYSTEM.LOG.info('   INFO: Loading all module controllers');
        let path = module.path + '/src/controller';
        SYSTEM.processFiles(path, "Controller.js", (file) => {
            let controllerName = SYSTEM.getFileNameWithoutExtension(file);
            if (CONTROLLER[controllerName]) {
                CONTROLLER[controllerName] = _.merge(CONTROLLER[controllerName], require(file));
            } else {
                CONTROLLER[controllerName] = require(file);
                CONTROLLER[controllerName].LOG = SYSTEM.createLogger(controllerName);
            }
        });
    }
};