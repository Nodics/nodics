/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    generateControllers: function(options) {
        let _self = this;
        options.modelName = options.schemaName.toUpperCaseEachWord();
        if (options.schemaObject.service) {
            let entityName = options.modelName + 'Controller';
            CONTROLLER[entityName] = SYSTEM.replacePlaceholders(options);
            CONTROLLER[entityName].LOG = SYSTEM.createLogger(entityName);
        }
    },

    init: function() {
        let controllerCommon = SYSTEM.loadFiles('/src/controller/common.js');
        SYSTEM.schemaWalkThrough({ commonDefinition: controllerCommon }, this.generateControllers);
    }
};