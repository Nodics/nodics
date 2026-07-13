const assert = require('assert');

/**
 * @module nRouter/test/routerContractTestUtils
 * @description Shared router test helpers for flattening nested route definitions and asserting route contract fields.
 * @layer test
 * @owner nRouter
 * @override Tests may reuse these helpers when validating project or framework route contracts without duplicating route traversal logic.
 */

/**
 * Flattens nested router configuration into route entries.
 *
 * @param {Object} routeConfig Nested router configuration.
 * @param {Array<string>} [path=[]] Current traversal path.
 * @param {Array<Object>} [routes=[]] Accumulated routes.
 * @returns {Array<Object>} Flat route entries with route name and path metadata.
 */
function flattenRoutes(routeConfig, path = [], routes = []) {
    Object.keys(routeConfig || {}).forEach((name) => {
        const value = routeConfig[name];
        if (!value || typeof value !== 'object') {
            return;
        }

        if (value.key && value.method) {
            routes.push(Object.assign({ name, path: path.concat(name) }, value));
            return;
        }

        flattenRoutes(value, path.concat(name), routes);
    });
    return routes;
}

/**
 * Asserts that a route list contains a route matching the expected contract.
 *
 * @param {Array<Object>} routes Flattened route entries.
 * @param {Object} expected Expected route fields.
 * @returns {Object} Matched route.
 * @throws Assertion error when the route or expected fields do not match.
 */
function assertRoute(routes, expected) {
    const route = routes.find((item) => {
        return item.key === expected.key
            && item.method === expected.method
            && (!expected.controller || item.controller === expected.controller)
            && (!expected.handler || item.handler === expected.handler);
    });

    const target = `${expected.method} ${expected.key}`;
    assert(route, `Expected route contract for ${target}`);

    ['controller', 'handler', 'operation', 'secured', 'permission', 'permissionConfig'].forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(expected, field)) {
            assert.strictEqual(route[field], expected[field], `Expected ${target} ${field}`);
        }
    });

    return route;
}

/**
 * Flattens router configuration and asserts all expected route contracts.
 *
 * @param {Object} routerConfig Nested router configuration.
 * @param {Array<Object>} expectedRoutes Expected route contracts.
 * @returns {Array<Object>} Flattened route entries.
 */
function assertRouteContracts(routerConfig, expectedRoutes) {
    const routes = flattenRoutes(routerConfig);
    expectedRoutes.forEach((expected) => assertRoute(routes, expected));
    return routes;
}

module.exports = {
    assertRoute,
    assertRouteContracts,
    flattenRoutes
};
