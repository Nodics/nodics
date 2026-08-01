/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cart/config/properties
 * @description Reserved cart property contribution for module-level configuration defaults.
 * @layer config
 * @owner cart
 * @override Project modules may provide later property contributions for cart-specific behavior, validation, and integration settings.
 */
module.exports = {
  cart: {
    checkoutEntry: {
      policy: {
        requiredFields: [
          "entCode",
          "entryCode",
          "lineNumber",
          "catalogCode",
          "itemType",
          "itemCode",
          "quantity",
          "unitCode",
          "currencyCode",
        ],
        quantityPattern: "^(0|[1-9][0-9]*)(\\.[0-9]+)?$",
        moneyPattern: "^(0|[1-9][0-9]*)(\\.[0-9]+)?$",
        maximumDigits: 38,
        maximumScale: 18,
        statuses: ["ACTIVE", "HELD", "RETIRED"],
        moneyFields: ["unitPrice", "totalPrice", "taxTotal", "discountTotal"],
        immutableFields: [
          "code",
          "entCode",
          "entryCode",
          "cartCode",
          "catalogCode",
          "itemType",
          "itemCode",
          "unitCode",
          "currencyCode",
        ],
        allowedTransitions: {
          ACTIVE: ["HELD", "RETIRED"],
          HELD: ["ACTIVE", "RETIRED"],
          RETIRED: [],
        },
        conversion: {
          sourceParentField: "cartCode",
          targetParentField: "orderCode",
          targetStatus: "ORDERED",
          copiedFields: [
            "entCode",
            "entryCode",
            "lineNumber",
            "catalogCode",
            "itemType",
            "itemCode",
            "quantity",
            "unitCode",
            "currencyCode",
            "unitPrice",
            "totalPrice",
            "taxTotal",
            "discountTotal",
            "priceEvidenceCode",
          ],
        },
      },
    },
  },
  backofficeCapabilities: {
    cart: {
      enabled: true,
      capabilityId: "cart-management",
      displayName: "Carts",
      category: "commerce",
      icon: "cart",
      contractVersion: 1,
      minimumClientContractVersion: 1,
      roles: ["FUNCTIONAL_CAPABILITY_PROVIDER"],
      discovery: {
        openApiPath: "/nodics/system/v0/contract/openapi/internal",
        contractVersion: 1,
      },
      navigation: [],
    },
  },
};
