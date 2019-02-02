/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

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