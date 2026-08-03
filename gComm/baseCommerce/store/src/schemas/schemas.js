/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module store/src/schemas/schemas
 * @description Schema definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
  store: {
    store: {
      super: "base",
      model: true,
      service: { enabled: true },
      router: { enabled: false },
      event: { enabled: false },
      definition: {
        enterpriseCode: {
          type: "string",
          required: true,
          description: "Authoritative enterprise owning the store",
        },
        storeCode: {
          type: "string",
          required: true,
          description:
            "Stable business store code unique inside the enterprise",
        },
        name: {
          type: "string",
          required: true,
          description: "Business-facing store name",
        },
        type: {
          type: "string",
          required: true,
          default: "PHYSICAL",
          description: "Configured physical or digital store classification",
        },
        status: {
          type: "string",
          required: true,
          default: "DRAFT",
          description: "Governed store lifecycle state",
        },
        countryCode: {
          type: "string",
          required: false,
          description: "Country served by a physical or country-bound store",
        },
        timezone: {
          type: "string",
          required: false,
          description: "IANA timezone used for store operations",
        },
        addressRef: {
          type: "string",
          required: false,
          description:
            "Reference to an address owned by an approved address provider",
        },
        channels: {
          type: "array",
          required: false,
          default: [],
          description:
            "Descriptive sales or experience channels supported by the store",
        },
        capabilities: {
          type: "array",
          required: false,
          default: [],
          description:
            "Configured store capabilities without inventory authority",
        },
        externalReferences: {
          type: "object",
          required: false,
          description:
            "Non-secret external commerce, POS, ERP, or facility identifiers",
        },
        effectiveFrom: { type: "date", required: false },
        effectiveTo: { type: "date", required: false },
      },
      indexes: {
        common: { enterpriseCode: { enabled: true, name: "enterpriseCode" } },
        individual: {
          storeCode: {
            enabled: true,
            name: "storeCode",
            options: { unique: true },
          },
          status: { enabled: true, name: "status" },
          countryCode: { enabled: true, name: "countryCode" },
        },
      },
    },
    storeWarehouseAssignment: {
      super: "base",
      model: true,
      service: { enabled: true },
      router: { enabled: false },
      event: { enabled: false },
      definition: {
        enterpriseCode: {
          type: "string",
          required: true,
          description: "Enterprise owning both sides of the association",
        },
        storeCode: {
          type: "string",
          required: true,
          description: "Store business code",
        },
        warehouseCode: {
          type: "string",
          required: true,
          description: "Inventory-owned warehouse business code",
        },
        status: {
          type: "string",
          required: true,
          default: "DRAFT",
          description: "Governed association lifecycle state",
        },
        purposes: {
          type: "array",
          required: true,
          description: "Configured reasons this warehouse serves the store",
        },
        priority: {
          type: "int",
          required: true,
          default: 100,
          description:
            "Lower value gives earlier consideration for the same purpose",
        },
        effectiveFrom: { type: "date", required: false },
        effectiveTo: { type: "date", required: false },
      },
      indexes: {
        common: {
          enterpriseCode: { enabled: true, name: "enterpriseCode" },
          storeCode: { enabled: true, name: "storeCode" },
        },
        individual: {
          warehouseCode: {
            enabled: true,
            name: "warehouseCode",
            options: { unique: true },
          },
          status: { enabled: true, name: "status" },
          priority: { enabled: true, name: "priority" },
        },
      },
    },
    pointOfService: {
      super: "base",
      model: true,
      service: { enabled: true },
      router: { enabled: false },
      event: { enabled: false },
      definition: {
        enterpriseCode: {
          type: "string",
          required: true,
          description: "Enterprise owning this Point of Service",
        },
        storeCode: {
          type: "string",
          required: true,
          description: "Store this Point of Service belongs to",
        },
        pointOfServiceCode: {
          type: "string",
          required: true,
          description:
            "Stable business Point of Service code unique inside the Store",
        },
        name: {
          type: "string",
          required: true,
          description: "Business-facing Point of Service name",
        },
        type: {
          type: "string",
          required: true,
          default: "PICKUP_COUNTER",
          description:
            "Configured Point of Service type such as pickup counter, locker, store front, or service desk",
        },
        status: {
          type: "string",
          required: true,
          default: "DRAFT",
          description: "Governed Point of Service lifecycle state",
        },
        addressRef: {
          type: "string",
          required: false,
          description:
            "Reference to an address owned by an approved address provider",
        },
        latitude: {
          type: "string",
          required: false,
          description:
            "Latitude as an exact string for map/display use; geography authority remains external",
        },
        longitude: {
          type: "string",
          required: false,
          description:
            "Longitude as an exact string for map/display use; geography authority remains external",
        },
        timezone: {
          type: "string",
          required: false,
          description:
            "IANA timezone used for opening hours and pickup promise display",
        },
        openingHoursPolicy: {
          type: "object",
          required: false,
          description:
            "Non-executable opening-hours policy owned by Store and extendable by customer modules",
        },
        pickupCapacityMode: {
          type: "string",
          required: true,
          default: "UNLIMITED",
          description:
            "Configured pickup capacity mode such as unlimited, slot count, provider managed, or disabled",
        },
        maxPickupOrdersPerSlot: {
          type: "int",
          required: false,
          description:
            "Optional configured pickup order capacity per slot when slot capacity is managed in Store",
        },
        slotDurationMinutes: {
          type: "int",
          required: false,
          description:
            "Optional pickup slot duration used with Store-owned slot-capacity policy",
        },
        capacityProviderCode: {
          type: "string",
          required: false,
          description:
            "Optional external capacity provider reference; credentials and provider state stay outside Store",
        },
        warehouseCode: {
          type: "string",
          required: false,
          description:
            "Optional Inventory-owned warehouse used for pickup sourcing or stock visibility",
        },
        fulfillmentModeCodes: {
          type: "array",
          required: false,
          default: [],
          description:
            "Fulfillment-owned mode codes this Point of Service can support, such as PICKUP",
        },
        inventoryReservationPolicyCode: {
          type: "string",
          required: false,
          description:
            "Optional Inventory-owned reservation policy reference for pickup promises",
        },
        externalReferences: {
          type: "object",
          required: false,
          description:
            "Non-secret POS, ERP, facility, locker, or pickup-network identifiers",
        },
        effectiveFrom: { type: "date", required: false },
        effectiveTo: { type: "date", required: false },
      },
      indexes: {
        common: {
          enterpriseCode: { enabled: true, name: "enterpriseCode" },
          storeCode: { enabled: true, name: "storeCode" },
          status: { enabled: true, name: "status" },
          type: { enabled: true, name: "type" },
        },
        individual: {
          pointOfServiceCode: {
            enabled: true,
            name: "pointOfServiceCode",
            options: { unique: true },
          },
          warehouseCode: { enabled: true, name: "warehouseCode" },
        },
      },
      refSchema: {
        storeCode: {
          type: "one",
          module: "store",
          schema: "store",
          property: "storeCode",
          onDelete: "restrict",
        },
        warehouseCode: {
          type: "one",
          module: "inventory",
          schema: "warehouse",
          property: "warehouseCode",
          onDelete: "restrict",
        },
        fulfillmentModeCodes: {
          type: "many",
          module: "fulfillment",
          schema: "fulfillmentMode",
          property: "modeCode",
          onDelete: "restrict",
        },
      },
    },
  },
};
