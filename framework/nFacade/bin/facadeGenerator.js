/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    generateFacades: function(options) {
        let _self = this;
        options.modelName = options.schemaName.toUpperCaseEachWord();
        if (options.schemaObject.service) {
            let entityName = options.modelName + 'Facade';
            FACADE[entityName] = SYSTEM.replacePlaceholders(options);
            FACADE[entityName].LOG = SYSTEM.createLogger(entityName);
        }
    },

    init: function() {
        let facadeCommon = SYSTEM.loadFiles('/src/facade/common.js');
        SYSTEM.schemaWalkThrough({ commonDefinition: facadeCommon }, this.generateFacades);
    }
};