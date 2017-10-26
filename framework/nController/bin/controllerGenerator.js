module.exports = {
    generateControllers: function(options) {
        let _self = this;
        options.modelName = options.schemaName.toUpperCaseEachWord();
        if (options.schemaObject.model) {
            CONTROLLER[options.modelName + 'Controller'] = SYSTEM.replacePlaceholders(options);
        }
    },

    init: function() {
        global.CONTROLLER = {};
        let controllerCommon = SYSTEM.loadFiles(CONFIG.getProperties(), '/src/controller/common.js');
        SYSTEM.schemaWalkThrough({ commonDefinition: controllerCommon }, this.generateControllers);
    }
};