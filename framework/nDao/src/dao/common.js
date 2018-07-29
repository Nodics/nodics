/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    get: function (input) {
        return NODICS.getModels('moduleName', input.tenant).modelName.getItems(input);
    },

    save: function (input) {
        return NODICS.getModels('moduleName', input.tenant).modelName.saveItems(input);
    },

    remove: function (input) {
        return NODICS.getModels('moduleName', input.tenant).modelName.removeItems(input);
    }
};