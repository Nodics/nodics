/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const fs = require('fs');

module.exports = {

    removeDir: function (path) {
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (file, index) {
                var curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    UTILS.removeDir(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    },

    isApiCashable: function (result, router) {
        if (result &&
            result instanceof Array &&
            result.length > 0 &&
            router.cache &&
            router.cache.enabled) {
            return true;
        } else if (result &&
            result instanceof Object &&
            !UTILS.isBlank(result) &&
            router.cache &&
            router.cache.enabled) {
            return true;
        } else {
            return false;
        }
    },

    isItemCashable: function (result, model) {
        if (result &&
            result instanceof Array &&
            result.length > 0 &&
            model.cache &&
            model.cache.enabled) {
            return true;
        } else if (result &&
            result instanceof Object &&
            !UTILS.isBlank(result) &&
            model.cache &&
            model.cache.enabled) {
            return true;
        } else {
            return false;
        }
    }
};