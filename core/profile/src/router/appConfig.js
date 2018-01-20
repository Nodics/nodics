/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    profile: {
        initSession: function(app) {
            //console.log('======================== Registering User App');
            /*app.use(function(req, res, next) {
                console.log('======================== > ');
                next();
            });*/
        },
        initLogger: function(app) {
            //console.log(' User initLogger');
        },
        initCache: function(app) {
            //console.log(' User initCache');
        },
        initBodyParser: function(app) {
            //console.log(' User initBodyParser');
        },
        initHeaders: function(app) {
            //console.log(' User initHeaders');
        },
        initErrorRoutes: function(app) {
            //console.log(' User initErrorRoutes');
        },
        initExtras: function(app) {
            //console.log(' User initExtras');
        }
    }
};