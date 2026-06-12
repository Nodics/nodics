const assert = require('assert');

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

function assertRoute(routes, expected) {
    const route = routes.find((item) => {
        return item.key === expected.key
            && item.method === expected.method
            && (!expected.controller || item.controller === expected.controller)
            && (!expected.handler || item.handler === expected.handler);
    });

    const target = `${expected.method} ${expected.key}`;
    assert(route, `Expected route contract for ${target}`);

    ['controller', 'handler', 'operation', 'secured'].forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(expected, field)) {
            assert.strictEqual(route[field], expected[field], `Expected ${target} ${field}`);
        }
    });

    return route;
}

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
