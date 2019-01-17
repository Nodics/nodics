/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    statusMap: {},

    init: function () {
        return new Promise((resolve, reject) => {
            try {
                SYSTEM.loadFiles('/src/utils/statusDefinitions.js', this.statusMap);
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },

    updateStatus: function (code, definition) {
        this.statusMap[code] = definition;
    },

    get: function (code) {
        if (!UTILS.isBlank(this.statusMap[code])) {
            return this.statusMap[code];
        } else {
            throw new Error('Invalid status code');
        }
    },
};