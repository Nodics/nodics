/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    get: function (request) {
        return SERVICE.srvcName.get(request);
    },

    getById: function (id, tenant) {
        return SERVICE.srvcName.getById(id, tenant);
    },

    getByCode: function (code, tenant) {
        return SERVICE.srvcName.getByCode(code, tenant);
    },

    save: function (request) {
        return SERVICE.srvcName.save(request);
    },

    remove: function (request) {
        return SERVICE.srvcName.remove(request);
    },

    removeById: function (ids, tenant) {
        return SERVICE.srvcName.removeById(ids, tenant);
    },

    removeByCode: function (codes, tenant) {
        return SERVICE.srvcName.removeByCode(codes, tenant);
    },

    update: function (request) {
        return SERVICE.srvcName.update(request);
    }
};