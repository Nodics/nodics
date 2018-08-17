/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    get: function (request, callback) {
        if (callback) {
            DAO.DaoName.get(request, callback).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return DAO.DaoName.get(request);
        }
    },

    save: function (request, callback) {
        if (callback) {
            DAO.DaoName.save(request, callback).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return DAO.DaoName.save(request);
        }
    },

    remove: function (request, callback) {
        if (callback) {
            DAO.DaoName.remove(request, callback).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return DAO.DaoName.remove(request);
        }
    }
};