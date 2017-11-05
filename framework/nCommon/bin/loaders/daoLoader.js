/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    loadDao: function(module) {
        console.log('   INFO: Loading all module DAO');
        let path = module.path + '/src/dao';
        SYSTEM.processFiles(path, "Dao.js", (file) => {
            let daoName = SYSTEM.getFileNameWithoutExtension(file);
            if (DAO[daoName]) {
                DAO[daoName] = _.merge(DAO[daoName], require(file));
            } else {
                let doaObject = require(file);
                if (doaObject.options.isNew) {
                    DAO[daoName] = doaObject;
                } else {
                    console.warn('   WARNING: Dao container doesn,t contain ' + daoName + ' and isNew Property is false. hence ignoring file ', file);
                }
            }
        });
    }
};