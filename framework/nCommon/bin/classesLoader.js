/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    loadClasses: function() {
        let classes = global.CLASSES;
        SYSTEM.LOG.info('=> Staring Classes loader process');

        let _self = this;
        let moduleIndex = CONFIG.get('moduleIndex');
        Object.keys(moduleIndex).forEach(function(key) {
            var value = moduleIndex[key][0];
            _self.loadModuleClasses(value);
        });
        this.generalizeClasses();
    },
    loadModuleClasses: function(module) {
        let path = module.path + '/src/lib';
        SYSTEM.processFiles(path, "*", (file) => {
            if (!file.endsWith('classes.js')) {
                let className = SYSTEM.getFileNameWithoutExtension(file);
                if (CLASSES[className]) {
                    CLASSES[className] = _.merge(CLASSES[className], require(file));
                } else {
                    CLASSES[className] = require(file);
                    //SYSTEM.LOG.info(' ++++++++++++++++++++++++++++++++++++++ : ', className);
                    //CLASSES[className].LOG = SYSTEM.createLogger(className);
                    //SYSTEM.LOG.info(' ++++++++++++++++++++++++++++++++++++++ : ', CLASSES[className].LOG);
                }
            }
        }, 'classes.js');
    },

    generalizeClasses: function() {
        let classesScripts = {};
        SYSTEM.LOG.info('   INFO: Generalizing defined classes');
        SYSTEM.loadFiles('/src/lib/classes.js', classesScripts);

        var methods = SYSTEM.getAllMethods(classesScripts);
        methods.forEach(function(instance) {
            classesScripts[instance]();
        });
    }
};