/**
 * @module nTooling/nodics
 * @description Module-shaped entrypoint for Nodics development and quality tooling. Package metadata excludes nTooling from application startup; executable commands use dedicated tooling entrypoints instead.
 * @layer module
 * @owner nTooling
 * @override Projects extend tooling through governed command contributions rather than changing this non-runtime compatibility entrypoint.
 */
module.exports = {
    /** @returns {Promise<boolean>} Resolves without registering runtime behavior. */
    init: function () {
        return Promise.resolve(true);
    },

    /** @returns {Promise<boolean>} Resolves without registering runtime behavior. */
    postInit: function () {
        return Promise.resolve(true);
    }
};
