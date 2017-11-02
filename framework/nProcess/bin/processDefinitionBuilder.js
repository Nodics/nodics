const _ = require('lodash');

module.exports = {
    buildDefaultHandler: function() {
        global.PROCESS = SYSTEM.loadFiles('/src/process/common.js');
    },

    buildProcessService: function() {
        let process = global.PROCESS || {};
        process['ProcessService'] = SYSTEM.loadFiles('/src/process/processService.js');
    },

    buildProcesses: function() {
        _self = this;
        let processDefinitions = SYSTEM.loadFiles('/src/process/processDefinition.js');
        let process = global.PROCESS || {};
        _.each(processDefinitions, function(value, key) {
            if (key !== 'defaultProcess') {
                tmpProcessHead = new CLASSES.ProcessHead(key, value, processDefinitions.defaultProcess);
                tmpProcessHead.init();
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