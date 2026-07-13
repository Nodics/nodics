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
