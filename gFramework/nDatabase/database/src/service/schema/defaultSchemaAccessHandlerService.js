/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

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

    getAccessPoint: function (authData, modelAccessGroups) {
        try {
            if (!modelAccessGroups || UTILS.isBlank(modelAccessGroups)) {
                return CONFIG.get('accessPoints').fullAccessPoint;
            } else if (!authData || !authData.userGroups) {
                throw new CLASSES.NodicsError('Invalid request, could not found user groups');
            } else {
                let accessPoint = 0;
                let filterGroups = authData.userGroups.filter(userGroup => Object.keys(modelAccessGroups).includes(userGroup));
                filterGroups.forEach(group => {
                    if (accessPoint < modelAccessGroups[group]) {
                        accessPoint = modelAccessGroups[group];
                    }
                });
                return accessPoint;
            }
        } catch (error) {
            throw new CLASSES.NodicsError(error, null, 'ERR_DBS_00000');
        }
    }
};