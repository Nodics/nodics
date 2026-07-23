/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/data/core/data/axis/axisCmsRouteData
 * @description Defines public employee-authentication routes and the secured Axis dashboard route.
 * @layer data
 * @owner backoffice
 */
module.exports = {
    record0: {
        code: 'axisLoginRoute', site: 'axisCmsSite', path: '/login', locale: 'en', channel: 'web',
        page: 'axisLoginPage', routeType: 'PAGE', deliveryState: 'ONLINE', accessMode: 'PUBLIC', active: true
    },
    record1: {
        code: 'axisForgotPasswordRoute', site: 'axisCmsSite', path: '/forgot-password', locale: 'en', channel: 'web',
        page: 'axisForgotPasswordPage', routeType: 'PAGE', deliveryState: 'ONLINE', accessMode: 'PUBLIC', active: true
    },
    record2: {
        code: 'axisDashboardRoute', site: 'axisCmsSite', path: '/dashboard', locale: 'en', channel: 'web',
        page: 'axisDashboardPage', routeType: 'PAGE', deliveryState: 'ONLINE', accessMode: 'AUTHENTICATED', active: true
    }
};
