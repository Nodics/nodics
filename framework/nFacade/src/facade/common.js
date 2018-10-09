/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    get: function (request, callback) {
        return SERVICE.ServiceName.get(request, callback);
    },

    save: function (request, callback) {
        return SERVICE.ServiceName.save(request, callback);
    },

    remove: function (request, callback) {
        return SERVICE.ServiceName.remove(request, callback);
    },

    removeById: function (request, callback) {
        return SERVICE.ServiceName.removeById(request, callback);
    },

    removeByCode: function (request, callback) {
        return SERVICE.ServiceName.removeByCode(request, callback);
    },

    update: function (request, callback) {
        return SERVICE.ServiceName.update(request, callback);
    }
};