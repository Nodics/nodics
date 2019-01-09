/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */
const ObjectId = require('mongodb').ObjectId;

module.exports = {

    find: function (request) {
        request.collection = NODICS.getModels('mdulnm', request.tenant).mdlnm;
        request.moduleName = request.moduleName || request.collection.moduleName;
        return SERVICE.DefaultPipelineService.start('modelsFindInitializerPipeline', request, {});
    }
};