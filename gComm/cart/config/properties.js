/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

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
        moneyFields: [
          "unitPrice",
          "unitNetAmount",
          "unitGrossAmount",
          "totalPrice",
          "lineNetAmount",
          "lineGrossAmount",
          "taxTotal",
          "discountTotal",
        ],
        taxInclusionModes: ["TAX_EXCLUSIVE", "TAX_INCLUSIVE"],
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
            "unitNetAmount",
            "unitGrossAmount",
            "totalPrice",
            "lineNetAmount",
            "lineGrossAmount",
            "taxTotal",
            "taxInclusionMode",
            "taxIncluded",
            "taxQuoteCode",
            "taxQuoteLineCode",
            "taxJurisdictionCode",
            "taxCategoryCode",
            "taxRateCode",
            "discountTotal",
            "priceEvidenceCode",
          ],
        },
      },
    },
    checkoutAllocation: {
      policy: {
        quantityPattern: "^(0|[1-9][0-9]*)(\\.[0-9]+)?$",
        moneyPattern: "^(0|[1-9][0-9]*)(\\.[0-9]+)?$",
        maximumDigits: 38,
        maximumScale: 18,
        deliveryGroupTypes: ["ADDRESS", "PICKUP", "DIGITAL", "SERVICE"],
        deliveryGroupStatuses: [
          "DRAFT",
          "ACTIVE",
          "ALLOCATED",
          "RELEASED",
          "CANCELLED",
        ],
        paymentGroupStatuses: [
          "DRAFT",
          "ACTIVE",
          "AUTHORIZED",
          "CAPTURED",
          "PARTIALLY_REFUNDED",
          "REFUNDED",
          "CANCELLED",
        ],
        allocationStatuses: [
          "ACTIVE",
          "RESERVED",
          "ALLOCATED",
          "RELEASED",
          "CANCELLED",
        ],
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
