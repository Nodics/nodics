/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    getAllUserGroupCodes: function (request, response) {
        return new Promise((resolve, reject) => {
            if (response.success.result && response.success.result.length > 0) {
                response.success.result.forEach(itemModel => {
                    if (itemModel.userGroups && itemModel.userGroups.length) {
                        if (!itemModel.userGroupCodes) itemModel.userGroupCodes = [];
                        itemModel.userGroups.forEach(userGroup => {
                            if (UTILS.isObject(userGroup)) {
                                itemModel.userGroupCodes.push(userGroup.code);
                            } else {
                                itemModel.userGroupCodes.push(userGroup);
                            }
                        });
                    }
                });
            }
            resolve(true);
        });
    }
};