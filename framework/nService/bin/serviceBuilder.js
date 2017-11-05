/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

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