/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    get: function (request) {
        return SERVICE.ServiceName.get(request);
    },

    getById: function (id, tenant) {
        return SERVICE.ServiceName.getById(id, tenant);
    },

    getByCode: function (code, tenant) {
        return SERVICE.ServiceName.getByCode(code, tenant);
    },

    save: function (request) {
        return SERVICE.ServiceName.save(request);
    },

    remove: function (request) {
        return SERVICE.ServiceName.remove(request);
    },

    removeById: function (ids, tenant) {
        return SERVICE.ServiceName.removeById(ids, tenant);
    },

    removeByCode: function (codes, tenant) {
        return SERVICE.ServiceName.removeByCode(codes, tenant);
    },

    update: function (request) {
        return SERVICE.ServiceName.update(request);
    }
};