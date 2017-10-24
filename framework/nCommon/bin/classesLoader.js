var _ = require('lodash');

module.exports = {
    loadClasses: function() {
        let classes = global.CLASSES = {};
        console.log('=> Staring Classes loader process');

        let _self = this;
        let moduleIndex = CONFIG.moduleIndex;
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
                }
            }
        }, 'classes.js');
    },

    generalizeClasses: function() {
        let classesScripts = {};
        console.log('   INFO: Generalizing defined classes');
        SYSTEM.loadFiles(CONFIG, '/src/lib/classes.js', classesScripts);

        var methods = SYSTEM.getAllMethods(classesScripts);
        methods.forEach(function(instance) {
            classesScripts[instance]();
        });
    }
};