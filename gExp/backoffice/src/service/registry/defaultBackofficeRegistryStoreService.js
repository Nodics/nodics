/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/service/registry/DefaultBackofficeRegistryStoreService
 * @description Provides the replaceable lease-store boundary used by the BackOffice observed-state registry.
 * @layer service
 * @owner backoffice
 * @override Distributed deployments must replace this memory implementation with a shared TTL-capable store while preserving this contract.
 */
module.exports = {
    _instances: new Map(),

    /** Initializes the default process-local registry store. */
    init: function () { return Promise.resolve(true); },
    /** Completes the standard service post-initialization contract. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns one observed lease by its stable module-instance key. */
    get: function (key) { return this._instances.get(key); },
    /** Creates or replaces one observed lease. */
    set: function (key, value) { this._instances.set(key, value); return value; },
    /** Removes one observed lease. */
    delete: function (key) { return this._instances.delete(key); },
    /** Iterates over the current observed lease snapshot. */
    forEach: function (iterator) { return this._instances.forEach(iterator); },
    /** Returns the current observed lease count. */
    size: function () { return this._instances.size; },
    /** Clears all process-local observed leases; intended for controlled shutdown and tests. */
    clear: function () { this._instances.clear(); }
};
