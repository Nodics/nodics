/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */



module.exports = {
    init: function (options) {
        // 
    },

    loadSearchConfig: function () {
        SYSTEM.LOG.info('Starting search configuration process');
        return new Promise((resolve, reject) => {
            SYSTEM.createSearchConnections().then(success => {
                SYSTEM.prepareSearchSchema().then(success => {
                    resolve(true);
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    }
};