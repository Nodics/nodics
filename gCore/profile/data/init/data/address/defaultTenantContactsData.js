/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gCore/profile/data/init/data/address/defaultTenantContactsData
 * @description Provides profile initializer or sample data consumed by the import layer.
 * @layer data
 * @owner profile
 * @override Projects may override or extend this initializer data through layered import data rather than editing out-of-the-box framework records.
 */
module.exports = {
    record0: {
        code: 'defaultEmployeeContact',
        active: true,
        prefix: '+91',
        type: 'PHONE',
        value: '9108464882'
    },
    record1: {
        code: 'defaultCustomerContact',
        active: true,
        prefix: '+91',
        type: 'PHONE',
        value: '9108464882'
    },
};