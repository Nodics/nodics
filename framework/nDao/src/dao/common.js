/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    get: function(input) {
        return NODICS.getModels('moduleName', input.tenant).modelName.get(input);
    },

    getById: function(input) {
        return NODICS.getModels('moduleName', input.tenant).modelName.getById(input);
    },

    save: function(input) {
        return NODICS.getModels('moduleName', input.tenant).modelName.save(input);
    },

    removeById: function(input) {
        return NODICS.getModels('moduleName', input.tenant).modelName.removeById(input);
    },

    update: function(input) {
        return NODICS.getModels('moduleName', input.tenant).modelName.update(input);
    },

    saveOrUpdate: function(input) {
        return NODICS.getModels('moduleName', input.tenant).modelName.saveOrUpdate(input);
    }
};