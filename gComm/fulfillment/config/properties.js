/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module fulfillment/config/properties
 * @description Fulfillment family group configuration. Keep this file light: composition-level configuration only.
 * @layer configuration
 * @owner fulfillment
 * @override Project modules may layer fulfillment-family composition metadata without copying child capability defaults.
 */
module.exports = {
    fulfillment: {
        journeyModules: [
            'fulfillmentCore',
        ],
    },
};
