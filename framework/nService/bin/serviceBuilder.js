module.exports = {
    generateServices: function(options) {
        let _self = this;
        options.modelName = options.schemaName.toUpperCaseEachWord();
        if (options.schemaObject.model) {
            SERVICE[options.modelName + 'Service'] = SYSTEM.replacePlaceholders(options);
        }
    },

    init: function() {
        global.SERVICE = {};
        let serviceCommon = SYSTEM.loadFiles(CONFIG, '/src/service/common.js');
        SYSTEM.schemaWalkThrough({ commonDefinition: serviceCommon }, this.generateServices);
    }
};