/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

module.exports = {
    loadFacades: function(module) {
        console.log('   INFO: Loading all module facades');
        let path = module.path + '/src/facade';
        SYSTEM.processFiles(path, "Facade.js", (file) => {
            let facadeName = SYSTEM.getFileNameWithoutExtension(file);
            if (FACADE[facadeName]) {
                FACADE[facadeName] = _.merge(FACADE[facadeName], require(file));
            } else {
                let facadeObject = require(file);
                if (facadeObject.options.isNew) {
                    FACADE[facadeName] = facadeObject;
                } else {
                    console.warn('   WARNING: Facade container doesn,t contain ' + facadeName + ' and isNew Property is false. hence ignoring file ', file);
                }
            }
        });
    }
};