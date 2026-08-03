/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module paymentProviders/config/properties
 * @description Payment Providers family group configuration. Keep this file composition-only.
 * @layer configuration
 * @owner paymentProviders
 * @override Project modules may add provider-family composition metadata without copying core provider defaults.
 */
module.exports = {
    paymentProviders: {
        providerModules: [
            'paymentProviderCore',
            'stripeProvider',
            'paypalProvider',
            'cyberSourceProvider',
            'visaProvider',
        ],
    },
};
