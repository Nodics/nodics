/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    handlePreGet: function (model, options) {
        return new Promise((resolve, reject) => {
            //console.log('Interceptor -> handlePreGet');
            resolve(true);
        });
    },

    handlePreGetOne: function (model, options) {
        return new Promise((resolve, reject) => {
            //console.log('Interceptor -> handlePreSaveGet');
            resolve(true);
        });
    },

    handlePostGet: function (model, options) {
        return new Promise((resolve, reject) => {
            //console.log('Interceptor -> handlePostGet');
            resolve(true);
        });
    },

    handlePostGetOne: function (model, options) {
        return new Promise((resolve, reject) => {
            //console.log('Interceptor -> handlePostGetOne');
            resolve(true);
        });
    }
};