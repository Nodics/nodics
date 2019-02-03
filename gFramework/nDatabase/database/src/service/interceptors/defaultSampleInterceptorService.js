/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    handlePreGet: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    handlePostGet: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    handlePostSave: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    handlePreRemove: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    handlePostRemove: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    handlePostUpdate: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

};