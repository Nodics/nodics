/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    get: function (request) {
        return DAO.DaoName.get(request);
    },

    getById: function (id, tenant) {
        return DAO.DaoName.getById(id, tenant);
    },

    getByCode: function (code, tenant) {
        return DAO.DaoName.getByCode(code, tenant);
    },

    save: function (request) {
        return DAO.DaoName.save(request);
    },

    remove: function (request) {
        return DAO.DaoName.remove(request);
    },

    removeById: function (ids, tenant) {
        return DAO.DaoName.removeById(ids, tenant);
    },

    removeByCode: function (codes, tenant) {
        return DAO.DaoName.removeByCode(codes, tenant);
    },

    update: function (request) {
        return DAO.DaoName.update(request);
    }
};