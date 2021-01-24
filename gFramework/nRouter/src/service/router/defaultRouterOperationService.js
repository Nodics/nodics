
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');
const Express = require('express');

module.exports = {

    serversConfigPool: '',

    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    registerWeb: function (moduleRouter, moduleObject) {
        if (UTILS.isWebEnabled(moduleObject.metaData.name)) {
            try {
                moduleObject.webRootDirName = CONFIG.get('webRootDirName');
                moduleObject.webDistDirName = CONFIG.get('webDistDirName');
                moduleConfig = CONFIG.get(moduleObject.metaData.name);
                moduleObject.pages = UTILS.getPages(moduleObject.metaData.name);
                moduleObject.entryHtmlPlugins = moduleConfig.getHtmlWebpackPlugin(moduleObject);
                let webpackConfig = moduleConfig.getWebpackConfig(moduleObject);
                const compiler = webpack(webpackConfig);
                moduleRouter.use(require('webpack-dev-middleware')(compiler, {
                    publicPath: webpackConfig.output.publicPath,
                    writeToDisk: true
                }));
                moduleRouter.use('/' + CONFIG.get('server').options.contextRoot + '/' + moduleObject.metaData.name, Express.static(path.join(moduleObject.modulePath, '/' + moduleObject.webRootDirName)));
            } catch (error) {
                SERVICE.DefaultRouterService.LOG.error(error);
            }
        }
    },

    bindOperation: function (req, res, routerDef) {
        try {
            routerDef = NODICS.getRouter(routerDef.routerName, routerDef.moduleName);
            if (routerDef.active) {
                SERVICE.DefaultRequestHandlerService.startRequestHandler(req, res, routerDef);
            } else {
                res.json({
                    success: false,
                    code: 'ERR_SYS_00000',
                    message: 'Process failed with errors',
                    error: 'This API is no more active currently'
                });
            }
        } catch (error) {
            SERVICE.DefaultRouterService.LOG.error(error);
            res.json({
                success: false,
                code: 'ERR_SYS_00000',
                message: 'Process failed with errors',
                error: error
            });
        }
    },

    get: function (moduleRouter, routerDef) {
        let _self = this;
        moduleRouter.get(routerDef.url, (req, res) => {
            _self.bindOperation(req, res, routerDef);
        });
    },
    post: function (moduleRouter, routerDef) {
        let _self = this;
        let bodyParserHandler = CONFIG.get('bodyParserHandler')[routerDef.bodyParserHandler] || CONFIG.get('bodyParserHandler').jsonBodyParserHandler;
        moduleRouter.post(routerDef.url, SERVICE[bodyParserHandler].getBodyParser(), (req, res) => {
            _self.bindOperation(req, res, routerDef);
        });
    },
    delete: function (moduleRouter, routerDef) {
        let _self = this;
        let bodyParserHandler = CONFIG.get('bodyParserHandler')[routerDef.bodyParserHandler] || CONFIG.get('bodyParserHandler').jsonBodyParserHandler;
        moduleRouter.delete(routerDef.url, SERVICE[bodyParserHandler].getBodyParser(), (req, res) => {
            _self.bindOperation(req, res, routerDef);
        });
    },
    put: function (moduleRouter, routerDef) {
        let _self = this;
        let bodyParserHandler = CONFIG.get('bodyParserHandler')[routerDef.bodyParserHandler] || CONFIG.get('bodyParserHandler').jsonBodyParserHandler;
        moduleRouter.put(routerDef.url, SERVICE[bodyParserHandler].getBodyParser(), (req, res) => {
            _self.bindOperation(req, res, routerDef);
        });
    },
    patch: function (moduleRouter, routerDef) {
        let _self = this;
        let bodyParserHandler = CONFIG.get('bodyParserHandler')[routerDef.bodyParserHandler] || CONFIG.get('bodyParserHandler').jsonBodyParserHandler;
        moduleRouter.patch(routerDef.url, SERVICE[bodyParserHandler].getBodyParser(), (req, res) => {
            _self.bindOperation(req, res, routerDef);
        });
    }
};