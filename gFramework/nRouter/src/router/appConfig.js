/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const bodyParser = require('body-parser');

module.exports = {
    default: {
        initProperties: function (app) {
            /* app.use(function(req, res, next) {
                 next('Done initProperties');
             });*/
        },
        initSession: function (app) {

        },
        initLogger: function (app) {

        },
        initCache: function (app) {

        },
        initBodyParser: function (app) {
            app.use(bodyParser.urlencoded({ extended: true }));
            //app.use(bodyParser.json());
            // app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }));
            //app.use(bodyParser.raw());
        },
        initHeaders: function (app) {

        },
        initErrorRoutes: function (app) {
            /*app.use(function(param, req, res, next) {
                next('This is custom value');
            });*/
        },
        initExtras: function (app) {

        }
    }
};