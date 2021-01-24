/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    getEmployeeRecursive: function (request, response) {
        return new Promise((resolve, reject) => {
            request.options.recursive = request.options.recursive || true;
            resolve(true);
        });
    },

    getAllUserGroupCodes: function (request, response) {
        return new Promise((resolve, reject) => {
            if (response.success.result && response.success.result.length > 0) {
                response.success.result.forEach(itemModel => {
                    itemModel.userGroupCodes = UTILS.getUserGroupCodes(itemModel.userGroups);
                });
            }
            resolve(true);
        });
    }
};