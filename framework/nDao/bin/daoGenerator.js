/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    generateDao: function(options) {
        let _self = this;
        options.modelName = options.schemaName.toUpperCaseEachWord();
        if (options.schemaObject.model) {
            DAO[options.modelName + 'Dao'] = SYSTEM.replacePlaceholders(options);
        }
    },

    init: function() {
        let daoCommon = SYSTEM.loadFiles('/src/dao/common.js');
        SYSTEM.schemaWalkThrough({ commonDefinition: daoCommon }, this.generateDao);
    }
};