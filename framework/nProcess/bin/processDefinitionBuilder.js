/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    buildDefaultHandler: function() {
        SYSTEM.loadFiles('/src/process/common.js', global.PROCESS);
    },

    buildProcessService: function() {
        let process = global.PROCESS;
        process['ProcessService'] = SYSTEM.loadFiles('/src/process/processService.js');
    },

    buildProcesses: function() {
        _self = this;
        let processDefinitions = SYSTEM.loadFiles('/src/process/processDefinition.js');
        let process = global.PROCESS;
        _.each(processDefinitions, function(value, key) {
            if (key !== 'defaultProcess') {
                tmpProcessHead = new CLASSES.ProcessHead(key, value, processDefinitions.defaultProcess);
                tmpProcessHead.buildProcess();
                process[key] = tmpProcessHead;
            }
        });
    },

    init: function() {
        this.buildDefaultHandler();
        this.buildProcessService();
        this.buildProcesses();
    }
};