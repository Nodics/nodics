/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module product/test/productBackofficeNavigationContract
 * @description Protects the backend-driven Axis Catalog navigation model, schema targets, and roadmap placeholders.
 * @layer test
 * @owner product
 * @override Projects may add customer navigation in later layers while preserving owning-schema authority and disabled placeholders for missing models.
 */
const assert = require("assert");
const backofficeContractService = require("../../../gExp/backoffice/src/service/contract/defaultBackofficeContractService");
const productProperties = require("../config/properties");
const productSchemas = require("../src/schemas/schemas").product;
const catalogSchemas =
  require("../../../gFramework/nCatalog/src/schemas/schemas").catalog;
const unitSchemas = require("../../../gCore/units/src/schemas/schemas").units;

const capability = productProperties.backofficeCapabilities.product;
const navigation = capability.navigation;
const byId = Object.fromEntries(navigation.map((item) => [item.id, item]));
const knownSchemas = {
  product: productSchemas,
  catalog: catalogSchemas,
  units: unitSchemas,
};

assert(
  backofficeContractService.validateBackofficeMetadata(capability),
  "Product BackOffice capability metadata must satisfy the framework contract",
);
assert.strictEqual(capability.category, "commerce");
assert.strictEqual(
  byId["catalog-and-products"].group.id,
  "commerce",
  "Catalog must remain under the Commerce top-level group",
);
assert.strictEqual(byId["catalog-management"].parentId, "catalog-and-products");
assert.strictEqual(byId.classification.parentId, "catalog-and-products");
assert.strictEqual(byId["product-enrichment"].parentId, "catalog-and-products");
assert.strictEqual(byId["product-publishing"].parentId, "catalog-and-products");
assert.strictEqual(byId.products.workbenchTarget.schemaName, "productItem");
assert(
  Array.isArray(byId.products.detailPanels) &&
    byId.products.detailPanels.length >= 6,
  "Product item workspace must expose backend-driven related detail panels",
);
assert.strictEqual(byId.catalogs.workbenchTarget.moduleName, "catalog");
assert.strictEqual(byId.units.workbenchTarget.moduleName, "units");
assert.strictEqual(
  byId["product-media"].workbenchTarget.schemaName,
  "productMedia",
);
assert.strictEqual(byId["catalog-versions"].featureState, "DISABLED");
assert.strictEqual(byId["keywords-tags"].featureState, "DISABLED");
assert.strictEqual(byId["classification-systems"].featureState, "DISABLED");

navigation.forEach((item) => {
  assert(
    item.route.startsWith("/commerce/catalog"),
    item.id + " must stay in the Catalog route family",
  );
  assert(
    item.help &&
      item.help.summary.length > 0 &&
      item.help.summary.length <= 320,
    item.id + " must provide bounded backend-owned help text",
  );
  assert(
    item.help.documentationRoute.startsWith("/docs/"),
    item.id +
      " must link to framework documentation, not an external or Axis-only document",
  );
  if (item.parentId) {
    assert(
      byId[item.parentId],
      item.id + " must not reference a missing parent navigation item",
    );
  }
  if (item.featureState !== "DISABLED") {
    assert(
      item.requiredPermissions.includes("product.backoffice.read"),
      item.id +
        " must require Product BackOffice read permission for visibility",
    );
    assert(
      item.workbenchTarget,
      item.id + " must declare a bounded workbench schema target",
    );
  }
  if (item.workbenchTarget) {
    const moduleSchemas = knownSchemas[item.workbenchTarget.moduleName];
    assert(
      moduleSchemas,
      item.id + " must target a known backend module schema registry",
    );
    assert(
      moduleSchemas[item.workbenchTarget.schemaName],
      item.id + " must target an implemented backend schema",
    );
  }
  (item.detailPanels || []).forEach((panel) => {
    const targetSchemas = knownSchemas[panel.target.moduleName];
    assert(
      targetSchemas,
      item.id + " detail panel " + panel.id + " must target a known module",
    );
    assert(
      targetSchemas[panel.target.schemaName],
      item.id +
        " detail panel " +
        panel.id +
        " must target an implemented schema",
    );
    if (panel.relation) {
      assert(
        productSchemas.productItem.definition[panel.relation.sourceField],
        item.id +
          " detail panel " +
          panel.id +
          " must map from a Product Item field",
      );
      assert(
        targetSchemas[panel.target.schemaName].definition[
          panel.relation.targetField
        ],
        item.id +
          " detail panel " +
          panel.id +
          " must map to an existing target schema field",
      );
    }
  });
});

console.log("Product BackOffice navigation contract validated");
