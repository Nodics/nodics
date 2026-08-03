/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gComm/baseCommerce/config/properties
 * @description Base Commerce group configuration. Keep this file light: composition-level configuration only, no business logic.
 * @layer configuration
 * @owner baseCommerce
 * @override Project modules may layer composition metadata without copying child capability defaults.
 */
module.exports = {
    baseCommerce: {
        foundationModules: [
            'store',
            'inventory',
            'pricing',
            'tax',
            'promotion',
            'product',
        ],
    },
};

