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
            let gVar = SYSTEM.getGlobalVariables('/src/facade/common.js');
            let serviceCommon = SYSTEM.loadFiles('/src/facade/common.js');
            let genDir = path.join(__dirname, '../src/facade/gen');
            if (!fs.existsSync(genDir)) {
                fs.mkdirSync(genDir);
            }
            SYSTEM.schemaWalkThrough({
                commonDefinition: serviceCommon,
                currentDir: genDir,
                postFix: 'Facade',
                gVar: gVar
            }).then(success => {
                resolve(true);
            }).catch(error => {
                reject(error);
            });
        });
    }
};