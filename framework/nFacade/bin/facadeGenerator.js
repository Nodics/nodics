const _ = require('lodash');

module.exports = {
    generateFacades: function(options) {
        let _self = this;
        options.modelName = options.schemaName.toUpperCaseEachWord();
        if (options.schemaObject.model) {
            FACADE[options.modelName + 'Facade'] = SYSTEM.replacePlaceholders(options);
        }
    },

    init: function() {
        global.FACADE = {};
        let facadeCommon = SYSTEM.loadFiles(CONFIG, '/src/facade/common.js');
        SYSTEM.schemaWalkThrough({ commonDefinition: facadeCommon }, this.generateFacades);
    }
};