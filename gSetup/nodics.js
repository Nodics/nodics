/*
    Nodics - Enterprise Micro-Services Management Framework

    gSetup is intentionally module-shaped for repository consistency, but it is
    excluded from runtime module loading by package metadata.
 */

module.exports = {
    init: function () {
        return Promise.resolve(true);
    },

    postInit: function () {
        return Promise.resolve(true);
    }
};
