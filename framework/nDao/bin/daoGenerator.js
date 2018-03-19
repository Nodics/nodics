/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const fs = require('fs');
const path = require("path");

module.exports = {
    init: function() {
        return new Promise((resolve, reject) => {
            let daoCommon = SYSTEM.loadFiles('/src/dao/common.js');
            let genDir = path.join(__dirname, '../src/dao/gen');
            SYSTEM.schemaWalkThrough({
                commonDefinition: daoCommon,
                currentDir: genDir,
                postFix: 'Dao'
            }).then(success => {
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    }
};