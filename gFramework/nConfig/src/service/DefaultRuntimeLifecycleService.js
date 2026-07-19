/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module config/service/DefaultRuntimeLifecycleService
 * @description Owns process-wide Nodics lifecycle state, signal handling, and
 * ordered drain/shutdown contributors without introducing provider-specific
 * behavior into the foundational runtime.
 * @layer service
 * @owner nConfig
 * @override Projects may change lifecycle deadlines and register later-layer
 * contributors, but exactly one service must own process signal handlers.
 */
module.exports = {
    _contributors: {},
    _installedHandlers: {},
    _shutdownPromise: null,

    /** Initializes the single process signal owner when lifecycle handling is enabled. */
    init: function () {
        let config = this.getConfig();
        if (config.enabled !== false && config.installSignalHandlers !== false) {
            this.installProcessHandlers();
        }
        return Promise.resolve(true);
    },

    /** Keeps the lifecycle service available after entity post-initialization. */
    postInit: function () {
        return Promise.resolve(true);
    },

    /** Returns the effective layered lifecycle configuration. */
    getConfig: function () {
        return (typeof CONFIG !== 'undefined' && CONFIG && CONFIG.get('runtimeLifecycle')) || {};
    },

    /** Returns allowed state transitions while preserving the existing `started` ready state. */
    getAllowedTransitions: function () {
        return {
            starting: ['started', 'degraded', 'draining', 'failed'],
            started: ['degraded', 'draining', 'failed'],
            degraded: ['started', 'draining', 'failed'],
            draining: ['stopping', 'failed'],
            stopping: ['stopped', 'failed'],
            failed: ['stopping', 'stopped'],
            stopped: []
        };
    },

    /** Moves the runtime through a validated lifecycle state transition. */
    transition: function (nextState) {
        let currentState = NODICS.getServerState();
        if (currentState === nextState) return nextState;
        let allowed = this.getAllowedTransitions()[currentState] || [];
        if (!allowed.includes(nextState)) {
            throw new Error('Invalid runtime lifecycle transition: ' + currentState + ' -> ' + nextState);
        }
        NODICS.setServerState(nextState);
        return nextState;
    },

    /** Registers one named process lifecycle contributor. */
    registerContributor: function (name, contributor) {
        if (!name || !contributor || typeof contributor !== 'object') {
            throw new Error('Runtime lifecycle contributor requires a name and definition');
        }
        if (this._contributors[name]) {
            throw new Error('Runtime lifecycle contributor already registered: ' + name);
        }
        this._contributors[name] = Object.assign({ order: 1000 }, contributor);
        return this._contributors[name];
    },

    /** Returns contributors in stable configured order. */
    getContributors: function () {
        return Object.keys(this._contributors).map(name => Object.assign({ name: name }, this._contributors[name]))
            .sort((left, right) => Number(left.order) - Number(right.order) || left.name.localeCompare(right.name));
    },

    /** Executes one contributor hook with a bounded timeout. */
    executeContributor: function (contributor, phase, context) {
        if (typeof contributor[phase] !== 'function') return Promise.resolve({ name: contributor.name, skipped: true });
        let timeoutMs = Number(contributor.timeoutMs || this.getConfig().contributorTimeoutMs || 10000);
        let timeout;
        return Promise.race([
            Promise.resolve().then(() => contributor[phase](context)).then(() => ({ name: contributor.name, completed: true })),
            new Promise((resolve, reject) => {
                timeout = setTimeout(() => reject(new Error('Runtime lifecycle contributor timed out: ' + contributor.name + '.' + phase)), timeoutMs);
            })
        ]).finally(() => clearTimeout(timeout));
    },

    /** Executes a lifecycle phase sequentially so dependency order remains deterministic. */
    executePhase: function (phase, context) {
        return this.getContributors().reduce((promise, contributor) => promise.then(results => {
            return this.executeContributor(contributor, phase, context).then(result => results.concat([result])).catch(error => {
                this.logError(error);
                return results.concat([{ name: contributor.name, completed: false, error: error.message }]);
            });
        }), Promise.resolve([]));
    },

    /** Marks the process ready only after listeners are active, then runs non-blocking ready contributors. */
    markStarted: function (context) {
        this.transition('started');
        return this.executePhase('ready', context || { reason: 'startup' });
    },

    /** Initiates one idempotent bounded drain and shutdown sequence. */
    requestShutdown: function (options) {
        options = options || {};
        if (this._shutdownPromise) return this._shutdownPromise;
        let context = {
            reason: options.reason || 'requested',
            signal: options.signal || null,
            startedAt: new Date().toISOString()
        };
        let timeoutMs = Number(options.timeoutMs || this.getConfig().shutdownTimeoutMs || 30000);
        let shutdownWork = Promise.resolve().then(() => {
            if (NODICS.getServerState() !== 'draining') this.transition('draining');
            return this.executePhase('drain', context);
        }).then(drainResults => {
            this.transition('stopping');
            return this.executePhase('shutdown', context).then(shutdownResults => ({ drainResults, shutdownResults }));
        }).then(result => {
            this.transition('stopped');
            return result;
        }).catch(error => {
            this.logError(error);
            let state = NODICS.getServerState();
            if (state !== 'failed' && state !== 'stopped') this.transition('failed');
            throw error;
        });
        let deadline;
        this._shutdownPromise = Promise.race([
            shutdownWork,
            new Promise((resolve, reject) => {
                deadline = setTimeout(() => reject(new Error('Runtime shutdown deadline exceeded after ' + timeoutMs + 'ms')), timeoutMs);
            })
        ]).finally(() => clearTimeout(deadline));
        return this._shutdownPromise;
    },

    /** Installs the only Nodics-owned process signal and fatal-error handlers. */
    installProcessHandlers: function () {
        if (Object.keys(this._installedHandlers).length > 0) return false;
        let config = this.getConfig();
        ['SIGTERM', 'SIGINT'].forEach(signal => {
            let handler = () => this.handleTermination(signal, 0);
            this._installedHandlers[signal] = handler;
            process.on(signal, handler);
        });
        if (config.handleFatalErrors !== false) {
            this._installedHandlers.uncaughtException = error => this.handleFatalError('uncaughtException', error);
            this._installedHandlers.unhandledRejection = error => this.handleFatalError('unhandledRejection', error);
            process.on('uncaughtException', this._installedHandlers.uncaughtException);
            process.on('unhandledRejection', this._installedHandlers.unhandledRejection);
        }
        return true;
    },

    /** Removes installed handlers for isolated tests and controlled runtime replacement. */
    uninstallProcessHandlers: function () {
        Object.keys(this._installedHandlers).forEach(eventName => {
            process.removeListener(eventName, this._installedHandlers[eventName]);
        });
        this._installedHandlers = {};
    },

    /** Handles termination signals through the bounded lifecycle sequence. */
    handleTermination: function (signal, exitCode) {
        return this.requestShutdown({ reason: 'signal', signal: signal }).catch(error => this.logError(error)).finally(() => {
            if (this.getConfig().exitOnSignal !== false) process.exit(exitCode);
        });
    },

    /** Handles fatal process errors without attempting to continue serving traffic. */
    handleFatalError: function (type, error) {
        this.logError(error);
        return this.requestShutdown({ reason: type }).catch(shutdownError => this.logError(shutdownError)).finally(() => {
            process.exit(1);
        });
    },

    /** Writes lifecycle errors through the configured logger when available. */
    logError: function (error) {
        if (this.LOG && typeof this.LOG.error === 'function') this.LOG.error(error);
        else console.error(error);
    },

    /** Resets mutable state for isolated contract tests. */
    reset: function () {
        this.uninstallProcessHandlers();
        this._contributors = {};
        this._shutdownPromise = null;
    }
};
