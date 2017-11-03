const _ = require('lodash');

module.exports = {
    generateFacades: function(options) {
        let _self = this;
        options.modelName = options.schemaName.toUpperCaseEachWord();
        if (options.schemaObject.service) {
            FACADE[options.modelName + 'Facade'] = SYSTEM.replacePlaceholders(options);
        }
    },

    init: function() {
        let facadeCommon = SYSTEM.loadFiles('/src/facade/common.js');
        SYSTEM.schemaWalkThrough({ commonDefinition: facadeCommon }, this.generateFacades);
    }
};