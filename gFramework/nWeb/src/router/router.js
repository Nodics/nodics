/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const webpack = require('webpack');
//const express = require('express');
//const path = require('path');

module.exports = {
    operations: {
        registerWeb: function (app, moduleObject) {
            if (UTILS.isWebEnabled(moduleObject.metaData.name)) {
                try {
                    moduleObject.webRootDirName = CONFIG.get('webRootDirName');
                    moduleObject.webDistDirName = CONFIG.get('webDistDirName');
                    moduleConfig = CONFIG.get(moduleObject.metaData.name);
                    moduleObject.pages = UTILS.getPages(moduleObject.metaData.name);
                    moduleObject.entryHtmlPlugins = moduleConfig.getHtmlWebpackPlugin(moduleObject);
                    let webpackConfig = moduleConfig.getWebpackConfig(moduleObject);
                    const compiler = webpack(webpackConfig);
                    app.use(require('webpack-dev-middleware')(compiler, {
                        publicPath: webpackConfig.output.publicPath,
                        writeToDisk: true
                    }));
                    app.use('/' + CONFIG.get('server').options.contextRoot + '/' + moduleObject.metaData.name, express.static(path.join(moduleObject.modulePath, '/' + moduleObject.webRootDirName)));
                } catch (error) {
                    SERVICE.DefaultRouterService.LOG.error(error);
                }
            }
        }
    }
};