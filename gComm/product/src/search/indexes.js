/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
