/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    loadServices: function(module) {
        SYSTEM.LOG.info('   INFO: Loading all module services');
        let path = module.path + '/src/service';
        SYSTEM.processFiles(path, "Service.js", (file) => {
            let serviceName = SYSTEM.getFileNameWithoutExtension(file);
            if (SERVICE[serviceName]) {
                SERVICE[serviceName] = _.merge(SERVICE[serviceName], require(file));
            } else {
                SERVICE[serviceName] = require(file);
                SERVICE[serviceName].LOG = SYSTEM.createLogger(serviceName);
            }
        });
    }
};