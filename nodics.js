/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const FRAMEWORK = require('./framework');
const util = require('util');


module.exports = {
    startNodics: function(options) {
        FRAMEWORK.startNodics(options);
        //console.log(util.inspect(NODICS.getModule('user').models.default.master.UserModel, { showHidden: false, depth: 3 }));
        //console.log(' ------------------------------------------------- ');
        //console.log(NODICS.getModule('user').models.default.master.UserModel);
    }
};