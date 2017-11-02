module.exports = {
    generateDao: function(options) {
        let _self = this;
        options.modelName = options.schemaName.toUpperCaseEachWord();
        if (options.schemaObject.model) {
            DAO[options.modelName + 'Dao'] = SYSTEM.replacePlaceholders(options);
        }
    },

    init: function() {
        global.DAO = {};
        let daoCommon = SYSTEM.loadFiles('/src/dao/common.js');
        SYSTEM.schemaWalkThrough({ commonDefinition: daoCommon }, this.generateDao);
    }
};