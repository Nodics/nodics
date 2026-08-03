/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cart/schemas/schemas
 * @description Cart schema contribution defining abstract cart ownership fields and the concrete persisted cart model.
 * @layer schema
 * @owner cart
 * @override Project modules may extend or govern the cart schema through layered schema fragments without modifying this definition.
 */
module.exports = {
  default: {
    abstractCart: {
      super: "base",
      model: false,
      service: {
        enabled: false,
      },
      router: {
        enabled: false,
      },
      definition: {
        entCode: {
          type: "string",
          required: true,
          description: "Enterprise code that order belongs",
          searchOptions: {
            enabled: true,
          },
        },
        refCode: {
          type: "string",
          required: true,
          description: "Merchant unique order code",
          searchOptions: {
            enabled: true,
          },
        },
      },
      indexes: {
        individual: {
          refCode: {
            name: "refCode",
            enabled: true,
            options: {
              unique: true,
            },
          },
        },
      },
    },
    abstractCartEntry: {
      super: "base",
      model: false,
      service: {
        enabled: false,
      },
      router: {
        enabled: false,
      },
      definition: {
        entCode: {
          type: "string",
          required: true,
          description: "Enterprise code that owns the checkout line entry",
          searchOptions: {
            enabled: true,
          },
        },
        entryCode: {
          type: "string",
          required: true,
          description:
            "Stable business identity for one cart or order line entry",
          searchOptions: {
            enabled: true,
          },
        },
        lineNumber: {
          type: "int",
          required: true,
          description:
            "Human-readable line position inside the parent cart or order",
          searchOptions: {
            enabled: true,
          },
        },
        catalogCode: {
          type: "string",
          required: true,
          description: "Catalog that owns the referenced product item",
          searchOptions: {
            enabled: true,
          },
        },
        itemType: {
          type: "string",
          required: true,
          description: "Product item type captured for the checkout line",
          searchOptions: {
            enabled: true,
          },
        },
        itemCode: {
          type: "string",
          required: true,
          description: "Product item code captured for the checkout line",
          searchOptions: {
            enabled: true,
          },
        },
        quantity: {
          type: "string",
          required: true,
          description:
            "Exact positive decimal-string quantity; never use floating point for commerce quantities",
        },
        unitCode: {
          type: "string",
          required: true,
          description: "Units-owned unit of measure reference for the quantity",
          searchOptions: {
            enabled: true,
          },
        },
        currencyCode: {
          type: "string",
          required: true,
          description: "Currency code used for persisted monetary evidence",
          searchOptions: {
            enabled: true,
          },
        },
        unitPrice: {
          type: "string",
          required: false,
          description:
            "Exact decimal-string unit price snapshot captured by checkout or pricing evidence",
        },
        unitNetAmount: {
          type: "string",
          required: false,
          description:
            "Exact decimal-string unit net amount before tax. For tax-inclusive pricing this is split from unit gross evidence",
        },
        unitGrossAmount: {
          type: "string",
          required: false,
          description:
            "Exact decimal-string unit gross customer-facing amount after tax. For tax-inclusive pricing this may equal the displayed unit price",
        },
        totalPrice: {
          type: "string",
          required: false,
          description:
            "Exact decimal-string line total snapshot captured by checkout or pricing evidence",
        },
        lineNetAmount: {
          type: "string",
          required: false,
          description: "Exact decimal-string line net amount before tax",
        },
        lineGrossAmount: {
          type: "string",
          required: false,
          description:
            "Exact decimal-string line gross customer-facing amount after tax",
        },
        taxTotal: {
          type: "string",
          required: false,
          description:
            "Exact decimal-string tax total snapshot; Tax remains authoritative for calculation rules",
        },
        taxInclusionMode: {
          type: "string",
          required: false,
          description:
            "Resolved pricing/tax inclusion mode such as TAX_EXCLUSIVE or TAX_INCLUSIVE",
          searchOptions: {
            enabled: true,
          },
        },
        taxIncluded: {
          type: "bool",
          required: false,
          default: false,
          description:
            "Whether the line tax amount is included in the customer-facing line amount",
          searchOptions: {
            enabled: true,
          },
        },
        taxQuoteCode: {
          type: "string",
          required: false,
          description: "Tax quote evidence code used for this line",
          searchOptions: {
            enabled: true,
          },
        },
        taxQuoteLineCode: {
          type: "string",
          required: false,
          description: "Tax quote line evidence code used for this line",
          searchOptions: {
            enabled: true,
          },
        },
        taxJurisdictionCode: {
          type: "string",
          required: false,
          description: "Tax jurisdiction applied to this line",
          searchOptions: {
            enabled: true,
          },
        },
        taxCategoryCode: {
          type: "string",
          required: false,
          description: "Tax category applied to this line",
          searchOptions: {
            enabled: true,
          },
        },
        taxRateCode: {
          type: "string",
          required: false,
          description: "Tax rate evidence applied to this line",
          searchOptions: {
            enabled: true,
          },
        },
        discountTotal: {
          type: "string",
          required: false,
          description:
            "Exact decimal-string discount total snapshot; Promotion/Discount remains authoritative for calculation rules",
        },
        priceEvidenceCode: {
          type: "string",
          required: false,
          description:
            "Optional pricing evidence or resolved price reference used to produce the line price",
        },
        status: {
          type: "string",
          required: true,
          default: "ACTIVE",
          description:
            "Line lifecycle status within the parent checkout aggregate",
          searchOptions: {
            enabled: true,
          },
        },
      },
      indexes: {
        individual: {
          entryCode: {
            name: "entryCode",
            enabled: true,
            options: {
              unique: true,
            },
          },
          itemCode: {
            name: "itemCode",
            enabled: true,
          },
          status: {
            name: "status",
            enabled: true,
          },
          taxQuoteCode: {
            name: "taxQuoteCode",
            enabled: true,
          },
          taxJurisdictionCode: {
            name: "taxJurisdictionCode",
            enabled: true,
          },
        },
      },
    },
    abstractCheckoutDeliveryGroup: {
      super: "base",
      model: false,
      service: {
        enabled: false,
      },
      router: {
        enabled: false,
      },
      definition: {
        entCode: {
          type: "string",
          required: true,
          description: "Enterprise code that owns this checkout delivery group",
          searchOptions: {
            enabled: true,
          },
        },
        deliveryGroupCode: {
          type: "string",
          required: true,
          description:
            "Stable business identity for one delivery group within a cart or order",
          searchOptions: {
            enabled: true,
          },
        },
        groupType: {
          type: "string",
          required: true,
          default: "ADDRESS",
          description:
            "Delivery group type such as ADDRESS, PICKUP, DIGITAL, or SERVICE",
          searchOptions: {
            enabled: true,
          },
        },
        addressCode: {
          type: "string",
          required: false,
          description:
            "Optional Profile address reference used by address-based delivery groups",
          searchOptions: {
            enabled: true,
          },
        },
        deliveryModeCode: {
          type: "string",
          required: false,
          description:
            "Optional delivery-mode reference. Fulfillment or shipping modules remain authoritative for mode rules.",
          searchOptions: {
            enabled: true,
          },
        },
        carrierCode: {
          type: "string",
          required: false,
          description:
            "Optional carrier or logistics reference captured as delivery evidence",
        },
        deliveryChargeQuoteCode: {
          type: "string",
          required: false,
          description:
            "Optional Pricing-owned delivery charge quote accepted for this checkout delivery group",
          searchOptions: {
            enabled: true,
          },
        },
        deliveryChargeAmount: {
          type: "string",
          required: false,
          description:
            "Exact decimal-string customer-facing delivery charge accepted for this group",
        },
        deliveryChargeCurrencyCode: {
          type: "string",
          required: false,
          description:
            "Currency code for the accepted delivery charge evidence",
          searchOptions: {
            enabled: true,
          },
        },
        deliveryChargeTaxMode: {
          type: "string",
          required: false,
          description:
            "Tax mode used when the delivery charge quote was accepted, such as NET or GROSS",
          searchOptions: {
            enabled: true,
          },
        },
        status: {
          type: "string",
          required: true,
          default: "DRAFT",
          description: "Delivery group lifecycle state",
          searchOptions: {
            enabled: true,
          },
        },
      },
      indexes: {
        individual: {
          deliveryGroupCode: {
            name: "deliveryGroupCode",
            enabled: true,
            options: {
              unique: true,
            },
          },
          status: {
            name: "status",
            enabled: true,
          },
        },
      },
    },
    abstractCheckoutPaymentGroup: {
      super: "base",
      model: false,
      service: {
        enabled: false,
      },
      router: {
        enabled: false,
      },
      definition: {
        entCode: {
          type: "string",
          required: true,
          description: "Enterprise code that owns this checkout payment group",
          searchOptions: {
            enabled: true,
          },
        },
        paymentGroupCode: {
          type: "string",
          required: true,
          description:
            "Stable business identity for one payment group within a cart or order",
          searchOptions: {
            enabled: true,
          },
        },
        paymentModeCode: {
          type: "string",
          required: true,
          description:
            "Payment-mode reference such as card, COD, wallet, gift card, or account credit",
          searchOptions: {
            enabled: true,
          },
        },
        currencyCode: {
          type: "string",
          required: true,
          description: "Currency code used for exact payment evidence",
          searchOptions: {
            enabled: true,
          },
        },
        plannedAmount: {
          type: "string",
          required: false,
          description:
            "Exact decimal-string amount intended for this payment group",
        },
        authorizedAmount: {
          type: "string",
          required: false,
          description:
            "Exact decimal-string amount authorized by the payment authority",
        },
        capturedAmount: {
          type: "string",
          required: false,
          description:
            "Exact decimal-string amount captured by the payment authority",
        },
        refundedAmount: {
          type: "string",
          required: false,
          description:
            "Exact decimal-string amount refunded by the payment authority",
        },
        paymentEvidenceCode: {
          type: "string",
          required: false,
          description:
            "Optional payment transaction, authorization, or gateway evidence code. Do not store secrets or raw card data.",
        },
        status: {
          type: "string",
          required: true,
          default: "DRAFT",
          description: "Payment group lifecycle state",
          searchOptions: {
            enabled: true,
          },
        },
      },
      indexes: {
        individual: {
          paymentGroupCode: {
            name: "paymentGroupCode",
            enabled: true,
            options: {
              unique: true,
            },
          },
          status: {
            name: "status",
            enabled: true,
          },
        },
      },
    },
    abstractCheckoutAllocation: {
      super: "base",
      model: false,
      service: {
        enabled: false,
      },
      router: {
        enabled: false,
      },
      definition: {
        entCode: {
          type: "string",
          required: true,
          description: "Enterprise code that owns this checkout allocation",
          searchOptions: {
            enabled: true,
          },
        },
        allocationCode: {
          type: "string",
          required: true,
          description:
            "Stable business identity for one quantity-level checkout allocation",
          searchOptions: {
            enabled: true,
          },
        },
        entryCode: {
          type: "string",
          required: true,
          description:
            "Checkout entry business identity whose quantity is being allocated",
          searchOptions: {
            enabled: true,
          },
        },
        quantity: {
          type: "string",
          required: true,
          description:
            "Exact positive decimal-string quantity allocated from the entry; allocation sums are validated by owner services",
        },
        unitCode: {
          type: "string",
          required: true,
          description:
            "Units-owned unit of measure reference for the allocated quantity",
          searchOptions: {
            enabled: true,
          },
        },
        serialNumbers: {
          type: "array",
          required: false,
          default: [],
          description:
            "Optional unit, serial, batch, or asset identifiers when allocation reaches inventory-unit granularity",
        },
        inventoryReservationCode: {
          type: "string",
          required: false,
          description:
            "Optional Inventory reservation evidence linked to this allocated quantity",
          searchOptions: {
            enabled: true,
          },
        },
        inventoryAllocationCode: {
          type: "string",
          required: false,
          description:
            "Optional Inventory allocation evidence linked to this allocated quantity",
          searchOptions: {
            enabled: true,
          },
        },
        status: {
          type: "string",
          required: true,
          default: "ACTIVE",
          description: "Allocation lifecycle state",
          searchOptions: {
            enabled: true,
          },
        },
      },
      indexes: {
        individual: {
          allocationCode: {
            name: "allocationCode",
            enabled: true,
            options: {
              unique: true,
            },
          },
          entryCode: {
            name: "entryCode",
            enabled: true,
          },
          status: {
            name: "status",
            enabled: true,
          },
        },
      },
    },
  },

  cart: {
    cart: {
      super: "abstractCart",
      model: true,
      service: {
        enabled: true,
      },
      router: {
        enabled: true,
      },
      cache: {
        enabled: false,
      },
      search: {
        enabled: false,
      },
      definition: {},
    },
    cartEntry: {
      super: "abstractCartEntry",
      model: true,
      service: {
        enabled: true,
      },
      router: {
        enabled: false,
      },
      cache: {
        enabled: false,
      },
      search: {
        enabled: false,
      },
      refSchema: {
        cartCode: {
          enabled: true,
          schemaName: "cart",
          type: "one",
          propertyName: "code",
          onTargetDelete: "RESTRICT",
        },
      },
      definition: {
        cartCode: {
          type: "string",
          required: true,
          description:
            "Parent cart code. Cart owns cart state while entries own line-level evidence.",
          searchOptions: {
            enabled: true,
          },
        },
      },
      indexes: {
        common: {
          entCode: {
            name: "entCode",
            enabled: true,
          },
          cartCode: {
            name: "cartCode",
            enabled: true,
          },
        },
        individual: {
          entryCode: {
            name: "entryCode",
            enabled: true,
            options: {
              unique: true,
            },
          },
          lineNumber: {
            name: "lineNumber",
            enabled: true,
          },
          itemCode: {
            name: "itemCode",
            enabled: true,
          },
          status: {
            name: "status",
            enabled: true,
          },
        },
      },
    },
    cartDeliveryGroup: {
      super: "abstractCheckoutDeliveryGroup",
      model: true,
      service: {
        enabled: true,
      },
      router: {
        enabled: false,
      },
      cache: {
        enabled: false,
      },
      search: {
        enabled: false,
      },
      refSchema: {
        cartCode: {
          enabled: true,
          schemaName: "cart",
          type: "one",
          propertyName: "code",
          onTargetDelete: "RESTRICT",
        },
      },
      definition: {
        cartCode: {
          type: "string",
          required: true,
          description: "Parent cart code for this delivery group",
          searchOptions: {
            enabled: true,
          },
        },
      },
      indexes: {
        common: {
          entCode: {
            name: "entCode",
            enabled: true,
          },
          cartCode: {
            name: "cartCode",
            enabled: true,
          },
        },
      },
    },
    cartDeliveryAllocation: {
      super: "abstractCheckoutAllocation",
      model: true,
      service: {
        enabled: true,
      },
      router: {
        enabled: false,
      },
      cache: {
        enabled: false,
      },
      search: {
        enabled: false,
      },
      refSchema: {
        cartCode: {
          enabled: true,
          schemaName: "cart",
          type: "one",
          propertyName: "code",
          onTargetDelete: "RESTRICT",
        },
        entryCode: {
          enabled: true,
          schemaName: "cartEntry",
          type: "one",
          propertyName: "entryCode",
          onTargetDelete: "RESTRICT",
        },
        deliveryGroupCode: {
          enabled: true,
          schemaName: "cartDeliveryGroup",
          type: "one",
          propertyName: "deliveryGroupCode",
          onTargetDelete: "RESTRICT",
        },
      },
      definition: {
        cartCode: {
          type: "string",
          required: true,
          description: "Parent cart code for this delivery allocation",
          searchOptions: {
            enabled: true,
          },
        },
        deliveryGroupCode: {
          type: "string",
          required: true,
          description: "Delivery group receiving this allocated entry quantity",
          searchOptions: {
            enabled: true,
          },
        },
      },
      indexes: {
        common: {
          entCode: {
            name: "entCode",
            enabled: true,
          },
          cartCode: {
            name: "cartCode",
            enabled: true,
          },
          deliveryGroupCode: {
            name: "deliveryGroupCode",
            enabled: true,
          },
        },
      },
    },
    cartPaymentGroup: {
      super: "abstractCheckoutPaymentGroup",
      model: true,
      service: {
        enabled: true,
      },
      router: {
        enabled: false,
      },
      cache: {
        enabled: false,
      },
      search: {
        enabled: false,
      },
      refSchema: {
        cartCode: {
          enabled: true,
          schemaName: "cart",
          type: "one",
          propertyName: "code",
          onTargetDelete: "RESTRICT",
        },
      },
      definition: {
        cartCode: {
          type: "string",
          required: true,
          description: "Parent cart code for this payment group",
          searchOptions: {
            enabled: true,
          },
        },
      },
      indexes: {
        common: {
          entCode: {
            name: "entCode",
            enabled: true,
          },
          cartCode: {
            name: "cartCode",
            enabled: true,
          },
        },
      },
    },
    cartPaymentAllocation: {
      super: "abstractCheckoutAllocation",
      model: true,
      service: {
        enabled: true,
      },
      router: {
        enabled: false,
      },
      cache: {
        enabled: false,
      },
      search: {
        enabled: false,
      },
      refSchema: {
        cartCode: {
          enabled: true,
          schemaName: "cart",
          type: "one",
          propertyName: "code",
          onTargetDelete: "RESTRICT",
        },
        entryCode: {
          enabled: true,
          schemaName: "cartEntry",
          type: "one",
          propertyName: "entryCode",
          onTargetDelete: "RESTRICT",
        },
        paymentGroupCode: {
          enabled: true,
          schemaName: "cartPaymentGroup",
          type: "one",
          propertyName: "paymentGroupCode",
          onTargetDelete: "RESTRICT",
        },
      },
      definition: {
        cartCode: {
          type: "string",
          required: true,
          description: "Parent cart code for this payment allocation",
          searchOptions: {
            enabled: true,
          },
        },
        paymentGroupCode: {
          type: "string",
          required: true,
          description: "Payment group funding this allocated entry quantity",
          searchOptions: {
            enabled: true,
          },
        },
        amount: {
          type: "string",
          required: true,
          description:
            "Exact non-negative decimal-string amount assigned to this payment allocation",
        },
        currencyCode: {
          type: "string",
          required: true,
          description: "Currency code used for the allocated payment amount",
          searchOptions: {
            enabled: true,
          },
        },
      },
      indexes: {
        common: {
          entCode: {
            name: "entCode",
            enabled: true,
          },
          cartCode: {
            name: "cartCode",
            enabled: true,
          },
          paymentGroupCode: {
            name: "paymentGroupCode",
            enabled: true,
          },
        },
      },
    },
  },
};
