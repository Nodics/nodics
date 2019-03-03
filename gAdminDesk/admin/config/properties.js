/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    admin: {
        getWebpackConfig: function (moduleObject) {
            return {
                mode: 'development',
                devtool: 'inline-source-map',
                entry: moduleObject.pages,
                output: {
                    path: path.join(moduleObject.modulePath, moduleObject.webRootDirName, moduleObject.webDistDirName),
                    publicPath: moduleObject.webDistDirName,
                    filename: '[name].build.js'
                },
                module: {
                    rules: [
                        {
                            test: /\.js$/,
                            exclude: /node_modules/,
                            loaders: ['babel-loader?presets[]=es2015,presets[]=react']
                        }
                    ]
                },
                plugins: [

                ].concat(this.getHtmlWebpackPlugin(moduleObject))
            };
        },

        getHtmlWebpackPlugin: function (moduleObject) {
            htmlPlugins = [];
            let defaultHbs = moduleObject.modulePath + '/' + moduleObject.webRootDirName + '/hbs/default.hbs';
            Object.keys(moduleObject.pages).map(key => {
                let template = moduleObject.modulePath + '/' + moduleObject.webRootDirName + '/hbs/' + key + '.hbs';
                if (!fs.existsSync(template)) {
                    template = defaultHbs;
                }
                htmlPlugins.push(new HtmlWebpackPlugin({
                    template: template,
                    chunks: [key],
                    filename: moduleObject.modulePath + '/' + moduleObject.webRootDirName + '/' + key + '.html',
                    cache: true,
                    hash: true
                }));
            });
            return htmlPlugins;
        }
    }
};