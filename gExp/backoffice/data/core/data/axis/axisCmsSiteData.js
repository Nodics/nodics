/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
