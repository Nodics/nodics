/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    loadProcessDefinition: function(module) {
        console.log('   INFO: Loading all module process definitions');
        let path = module.path + '/src/process';
        SYSTEM.processFiles(path, "Definition.js", (file) => {
            let processName = SYSTEM.getFileNameWithoutExtension(file);
            if (PROCESS[processName]) {
                PROCESS[processName] = _.merge(PROCESS[processName], require(file));
            } else {
                PROCESS[processName] = require(file);
            }
        });
    }
};