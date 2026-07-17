/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

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
