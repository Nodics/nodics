const fs = require('fs');
const path = require('path');
const _ = require('lodash');

/**
 * @module nTest/service/DefaultLayeredTestConfigurationService
 * @description Discovers declarative UTest and NTest suites from active modules in deterministic module-index order and merges later project, environment, server, and node contributions without inferring behavior from module names.
 * @layer service
 * @owner nTest
 * @override Projects customize discovery through `test.layeredDiscovery.paths` or by overriding this service in a later module layer.
 */
module.exports = {
    /** Loads layered tests during startup only when the runtime test capability is enabled. */
    init: function () {
        const testConfig = CONFIG.get('test') || {};
        if (testConfig.enabled && (!testConfig.layeredDiscovery || testConfig.layeredDiscovery.enabled !== false)) {
            this.discover(testConfig.layeredDiscovery || {});
        }
        return Promise.resolve(true);
    },

    /** Standard service post-initialization contract. */
    postInit: function () {
        return Promise.resolve(true);
    },

    /**
     * Discovers and composes declarative suites from every active indexed module.
     *
     * @param {Object} options Layered discovery options.
     * @returns {Object} Effective global TEST registry.
     */
    discover: function (options) {
        this.ensureRegistry();
        this.resetRegistry();
        TEST.discovery = { paths: this.getDiscoveryPaths(options), contributions: [], overrides: [] };
        const suitePools = {};
        NODICS.getIndexedModules().forEach(moduleObject => {
            TEST.discovery.paths.forEach(relativePath => {
                this.getContributionFiles(path.join(moduleObject.path, relativePath)).forEach(filePath => {
                    this.mergeContribution(moduleObject, relativePath, filePath, require(filePath), suitePools);
                });
            });
        });
        this.rebuildPoolData();
        return TEST;
    },

    /** Returns normalized configurable discovery paths. */
    getDiscoveryPaths: function (options) {
        return Array.from(new Set(['test/common'].concat(options.paths || []).map(value => String(value).replace(/^[/\\]+/, '')).filter(Boolean)));
    },

    /** Recursively returns JavaScript contribution files in deterministic order. */
    getContributionFiles: function (rootPath) {
        if (!fs.existsSync(rootPath)) return [];
        let files = [];
        fs.readdirSync(rootPath).sort().forEach(name => {
            const filePath = path.join(rootPath, name);
            if (fs.statSync(filePath).isDirectory()) files = files.concat(this.getContributionFiles(filePath));
            else if (name.endsWith('.js')) files.push(filePath);
        });
        return files;
    },

    /** Merges one module-owned test contribution and records its effective source. */
    mergeContribution: function (moduleObject, relativePath, filePath, contribution, suitePools) {
        Object.keys(contribution || {}).forEach(suiteName => {
            const suite = contribution[suiteName];
            if (!suite || !suite.options) return;
            const poolName = String(suite.options.type || 'utest').toLowerCase() === 'ntest' ? 'nTestPool' : 'uTestPool';
            const previousPool = suitePools[suiteName];
            const overridden = !!previousPool || !!TEST[poolName].suites[suiteName];
            const inheritedSuite = previousPool ? TEST[previousPool].suites[suiteName] : TEST[poolName].suites[suiteName];
            if (previousPool && previousPool !== poolName) delete TEST[previousPool].suites[suiteName];
            TEST[poolName].suites[suiteName] = _.merge({}, inheritedSuite || {}, suite);
            TEST[poolName].data = _.merge(TEST[poolName].data, suite.data || {});
            suitePools[suiteName] = poolName;
            const trace = {
                moduleName: moduleObject.name,
                moduleKind: this.getModuleKind(moduleObject),
                relativePath: relativePath,
                file: this.relativeFile(filePath),
                suiteName: suiteName,
                pool: poolName
            };
            TEST.discovery.contributions.push(trace);
            if (overridden) TEST.discovery.overrides.push(trace);
        });
    },

    /** Returns canonical package kind from the raw registry with an indexed-fixture fallback. */
    getModuleKind: function (moduleObject) {
        const rawModule = NODICS.getRawModule && NODICS.getRawModule(moduleObject.name);
        const metadata = rawModule && rawModule.metaData || moduleObject.metaData;
        return metadata && metadata.nodics && metadata.nodics.kind;
    },

    /** Ensures callers and isolated tests receive the standard pool structure. */
    ensureRegistry: function () {
        global.TEST = global.TEST || {};
        ['uTestPool', 'nTestPool'].forEach(poolName => {
            TEST[poolName] = TEST[poolName] || {};
            TEST[poolName].data = TEST[poolName].data || {};
            TEST[poolName].suites = TEST[poolName].suites || {};
        });
    },

    /** Clears previously discovered suites so reloads cannot retain inactive module contributions. */
    resetRegistry: function () {
        ['uTestPool', 'nTestPool'].forEach(poolName => {
            TEST[poolName].data = {};
            TEST[poolName].suites = {};
        });
    },

    /** Rebuilds pool-level shared data from effective suites after all overrides. */
    rebuildPoolData: function () {
        ['uTestPool', 'nTestPool'].forEach(poolName => {
            TEST[poolName].data = {};
            Object.keys(TEST[poolName].suites).forEach(suiteName => {
                TEST[poolName].data = _.merge(TEST[poolName].data, TEST[poolName].suites[suiteName].data || {});
            });
        });
    },

    /** Returns a diagnostic path without exposing unrelated absolute filesystem roots. */
    relativeFile: function (filePath) {
        const home = NODICS.getNodicsHome && NODICS.getNodicsHome();
        return home ? path.relative(home, filePath) : filePath;
    }
};
