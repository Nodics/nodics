/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module order/config/properties
 * @description Reserved order property contribution for module-level configuration defaults.
 * @layer config
 * @owner order
 * @override Project modules may provide later property contributions for order lifecycle, validation, and integration settings.
 */
module.exports = {
    backofficeCapabilities: {
        order: {
            enabled: true, capabilityId: 'order-management', displayName: 'Orders',
            category: 'commerce', icon: 'commerce', contractVersion: 1,
            minimumClientContractVersion: 1, roles: ['FUNCTIONAL_CAPABILITY_PROVIDER'],
            discovery: { openApiPath: '/nodics/system/v0/contract/openapi/internal', contractVersion: 1 },
            navigation: [{ id: 'orders', label: 'Orders', route: '/commerce/orders',
                icon: 'commerce', order: 490,
                group: { id: 'commerce', label: 'Commerce', order: 300 },
                perspectives: ['operations', 'commerce'],
                contexts: ['environment', 'tenant', 'enterprise'],
                featureState: 'DISABLED' }]
        }
    }
};
