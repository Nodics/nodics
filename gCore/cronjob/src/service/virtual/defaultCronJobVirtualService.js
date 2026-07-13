/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cronjob/service/virtual/DefaultCronJobVirtualService
 * @description Virtual field service for deriving cronjob display values.
 * @layer service
 * @owner cronjob
 * @override Project modules may override virtual value generation for cronjob models.
 */
module.exports = {
    /**
     * Builds a display name for a cronjob document.
     *
     * @param {Object} doc Cronjob document.
     * @returns {string} Derived display name.
     */
    getFullName: function (doc) {
        return doc.code + ' Nodics Framework';
    }
};
