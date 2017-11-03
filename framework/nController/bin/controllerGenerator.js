module.exports = {
    generateControllers: function(options) {
        let _self = this;
        options.modelName = options.schemaName.toUpperCaseEachWord();
        if (options.schemaObject.service) {
            CONTROLLER[options.modelName + 'Controller'] = SYSTEM.replacePlaceholders(options);
        }
    },

    init: function() {
        let controllerCommon = SYSTEM.loadFiles('/src/controller/common.js');
        SYSTEM.schemaWalkThrough({ commonDefinition: controllerCommon }, this.generateControllers);
    }
};