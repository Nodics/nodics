/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    doGet: function (request) {
        return SERVICE.srvcName.doGet(request);
    },

    doSave: function (request) {
        return SERVICE.srvcName.doSave(request);
    },

    doRemove: function (request) {
        return SERVICE.srvcName.doRemove(request);
    }
};