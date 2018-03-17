/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    loadFacades: function(module) {
        SYSTEM.LOG.info('   INFO: Loading all module facades');
        let path = module.path + '/src/facade';
        SYSTEM.processFiles(path, "Facade.js", (file) => {
            let facadeName = SYSTEM.getFileNameWithoutExtension(file);
            if (FACADE[facadeName]) {
                FACADE[facadeName] = _.merge(FACADE[facadeName], require(file));
            } else {
                FACADE[facadeName] = require(file);
                FACADE[facadeName].LOG = SYSTEM.createLogger(facadeName);
            }
        });
    }
};