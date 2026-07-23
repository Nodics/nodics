/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/data/core/data/axis/axisCmsSiteData
 * @description Binds the Axis CMS site to the Axis content catalog.
 * @layer data
 * @owner backoffice
 */
module.exports = {
    record0: {
        code: 'axisCmsSite',
        name: 'Nodics Axis',
        catalog: 'axisContentCatalog',
        accessGroups: ['employeeUserGroup'],
        active: true
    }
};
