/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    get: function(input, callback) {
        return NODICS.getModels('moduleName', input.tenant).modelName.get(input, callback);
    },

    getById: function(input, callback) {
        return NODICS.getModels('moduleName', input.tenant).modelName.getById(input, callback);
    },

    getByCode: function(input, callback) {
        return NODICS.getModels('moduleName', input.tenant).modelName.getByCode(input, callback);
    },

    save: function(input, callback) {
        return NODICS.getModels('moduleName', input.tenant).modelName.save(input, callback);
    },

    removeById: function(input, callback) {
        return NODICS.getModels('moduleName', input.tenant).modelName.removeById(input, callback);
    },

    removeByCode: function(input, callback) {
        return NODICS.getModels('moduleName', input.tenant).modelName.removeByCode(input, callback);
    },

    update: function(input, callback) {
        return NODICS.getModels('moduleName', input.tenant).modelName.update(input, callback);
    },

    saveOrUpdate: function(input, callback) {
        return NODICS.getModels('moduleName', input.tenant).modelName.saveOrUpdate(input, callback);
    }
};