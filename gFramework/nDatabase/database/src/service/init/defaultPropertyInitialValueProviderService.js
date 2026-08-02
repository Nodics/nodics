/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/service/init/DefaultPropertyInitialValueProviderService
 * @description Provides default property values used by schema-driven model
 * initialization. Generated save flows can reference this provider from schema
 * property metadata to assign dynamic initial values.
 * @layer service
 * @owner nDatabase
 * @override Project modules may override or extend this service with additional
 * dynamic value providers while preserving callable method names referenced by
 * schema definitions.
 */
module.exports = {
    /**
     * Returns the current server timestamp.
     *
     * @returns {Date} Current date/time from the application node.
     */
    getCurrentTimestamp: function () {
        return new Date();
    }
};
