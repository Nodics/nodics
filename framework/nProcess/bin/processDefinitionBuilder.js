/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    /* 
        buildDefaultHandler: function() {
            return SYSTEM.loadFiles('/src/process/common.js');
        },

        buildProcessService: function() {
            let process = global.PROCESS;
            process['ProcessService'] = SYSTEM.loadFiles('/src/process/processService.js');
        },
    */
    buildProcesses: function() {
        _self = this;
        global.PROCESS = SYSTEM.loadFiles('/src/process/processDefinition.js');
        /*
            let process = global.PROCESS;
            _.each(processDefinitions, function(value, key) {
                if (key !== 'defaultProcess') {
                    tmpProcessHead = new CLASSES.ProcessHead(key, value, processDefinitions.defaultProcess);
                    tmpProcessHead.buildProcess();
                    process[key] = tmpProcessHead;
                }
            });
        */
    },

    init: function() {
        // let commonHandlers = this.buildDefaultHandler();
        // this.buildProcessService();
        this.buildProcesses();
    }
};