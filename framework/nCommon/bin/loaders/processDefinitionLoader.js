var _ = require('lodash');

module.exports = {
    loadProcessDefinition: function(module) {
        console.log('#### Staring process to load Process Definitions for Module : ', module.name);
        if (!global.PROCESS) {
            global.PROCESS = {};
        }
        let path = module.path + '/process';
        SYSTEM.processFiles(path, "Definition.js", (file) => {
            let processName = SYSTEM.getFileNameWithoutExtension(file);
            if (PROCESS[processName]) {
                PROCESS[processName] = _.merge(PROCESS[processName], require(file));
            } else {
                PROCESS[processName] = require(file);
            }
        });
    }
}