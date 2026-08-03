/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module product/search/indexes @description Defines the Product-owned Online search document contract consumed by the existing nSearch authority. @layer search @owner product */
module.exports = { product: {
    productOnline: {
        enabled: false,
        idPropertyName: 'code',
        properties: {
            enterpriseCode: { enabled: true }, catalogCode: { enabled: true }, itemType: { enabled: true }, itemCode: { enabled: true },
            name: { enabled: true }, description: { enabled: true }, sellable: { enabled: true }, stockManaged: { enabled: true },
            categoryCodes: { enabled: true }, attributes: { enabled: true }, media: { enabled: true }, releaseVersion: { enabled: true }
        }
    }
} };
