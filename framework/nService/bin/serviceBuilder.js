module.exports = {
    generateServices: function(options) {
        let _self = this;
        options.modelName = options.schemaName.toUpperCaseEachWord();
        if (options.schemaObject.service) {
            SERVICE[options.modelName + 'Service'] = SYSTEM.replacePlaceholders(options);
        }
    },

    init: function() {
        let serviceCommon = SYSTEM.loadFiles('/src/service/common.js');
        SYSTEM.schemaWalkThrough({ commonDefinition: serviceCommon }, this.generateServices);
    }
};