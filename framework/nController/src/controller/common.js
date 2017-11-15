/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    moduleName: 'mdulName',
    /*
        getTemp: function(processRequest, processResponse) {
            let response = {};
            DAO.CronJobDao.get().then((models) => {
                processRequest.callback(models, processRequest, processResponse);
            }).catch((error) => {
                console.log('       --------- Controller error ', error);
            });
        },
    */
    get: function(input, output, callback) {
        FACADE.FacadeName.get(input, output, callback);
    },
    getById: function(input, output, callback) {
        FACADE.FacadeName.getById(input, output, callback);
    },
    getByCode: function(input, output, callback) {
        FACADE.FacadeName.getByCode(input, output, callback);
    },
    save: function(input, output, callback) {
        FACADE.FacadeName.save(input, output, callback);
    },
    removeById: function(input, output, callback) {
        FACADE.FacadeName.removeById(input, output, callback);
    },
    removeByCode: function(input, output, callback) {
        FACADE.FacadeName.removeByCode(input, output);
    },
    update: function(input, output, callback) {
        FACADE.FacadeName.update(input, output, callback);
    },
    saveOrUpdate: function(input, output, callback) {
        FACADE.FacadeName.saveOrUpdate(input, output, callback);
    }
}