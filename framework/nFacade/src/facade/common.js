/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    get: function(request, callback) {
        return SERVICE.ServiceName.get(request, callback);
    },

    getById: function(request, callback) {
        return SERVICE.ServiceName.getById(request, callback);
    },

    getByCode: function(request, callback) {
        return SERVICE.ServiceName.getByCode(request, callback);
    },

    save: function(request, callback) {
        return SERVICE.ServiceName.save(request, callback);
    },

    removeById: function(request, callback) {
        return SERVICE.ServiceName.removeById(request, callback);
    },

    removeByCode: function(request, callback) {
        return SERVICE.ServiceName.removeByCode(request, callback);
    },

    update: function(request, callback) {
        return SERVICE.ServiceName.update(request, callback);
    },

    saveOrUpdate: function(request, callback) {
        return SERVICE.ServiceName.saveOrUpdate(request, callback);
    }
};