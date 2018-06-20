/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const path = require('path');


module.exports = {
    admin: {
        getWebpackConfig: function (moduleObject) {
            return {
                mode: 'development',
                devtool: 'inline-source-map',
                entry: {
                    home: path.join(moduleObject.modulePath, moduleObject.webRootDirName, 'js/index.js')
                },
                output: {
                    path: path.join(moduleObject.modulePath, moduleObject.webRootDirName, moduleObject.webLibDirName),
                    publicPath: '/',
                    filename: 'bundle.js'
                },
                module: {
                    rules: [
                        {
                            test: /\.js$/,
                            exclude: /node_modules/,
                            loaders: ['babel-loader?presets[]=es2015,presets[]=react']
                        }
                    ]
                }
            }
        },
        webpackCompilerOptions: {
            publicPath: '/',
            writeToDisk: true
        }
    }
};