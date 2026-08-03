/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module tax/src/interceptors/interceptors @description Tax enterprise scoping, validation, lifecycle, and no-hard-delete hooks. @layer interceptor @owner tax */
const scoped = function (schema, prepare, update) {
  const result = {};
  result[schema + "PreSave"] = {
    type: "schema",
    item: schema,
    trigger: "preSave",
    active: "true",
    index: -100,
    handler: prepare,
  };
  result[schema + "PreGet"] = {
    type: "schema",
    item: schema,
    trigger: "preGet",
    active: "true",
    index: -100,
    handler: "DefaultTaxEnterpriseScopeService.scopeQuery",
  };
  result[schema + "PreUpdate"] = {
    type: "schema",
    item: schema,
    trigger: "preUpdate",
    active: "true",
    index: -100,
    handler: update,
  };
  result[schema + "PreRemove"] = {
    type: "schema",
    item: schema,
    trigger: "preRemove",
    active: "true",
    index: -100,
    handler: "DefaultTaxValidationService.rejectHardDelete",
  };
  return result;
};

module.exports = Object.assign(
  {},
  scoped(
    "taxJurisdiction",
    "DefaultTaxValidationService.prepareJurisdiction",
    "DefaultTaxValidationService.prepareJurisdictionUpdate",
  ),
  scoped(
    "taxProvider",
    "DefaultTaxValidationService.prepareProvider",
    "DefaultTaxValidationService.prepareProviderUpdate",
  ),
  scoped(
    "taxRate",
    "DefaultTaxValidationService.prepareRate",
    "DefaultTaxValidationService.prepareRateUpdate",
  ),
  scoped(
    "taxExemption",
    "DefaultTaxValidationService.prepareExemption",
    "DefaultTaxValidationService.prepareExemptionUpdate",
  ),
  scoped(
    "taxQuote",
    "DefaultTaxValidationService.prepareQuote",
    "DefaultTaxValidationService.prepareQuoteUpdate",
  ),
  scoped(
    "taxQuoteLine",
    "DefaultTaxValidationService.prepareQuoteLine",
    "DefaultTaxValidationService.prepareQuoteLineUpdate",
  ),
);
