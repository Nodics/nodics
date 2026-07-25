/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
const contracts = require('../../schemas/apiContracts');

/**
 * @module backoffice/service/contract/DefaultBackofficeContractService
 * @description Validates BackOffice registration and module-owned catalogue metadata against the authoritative API contracts.
 * @layer service
 * @owner backoffice
 * @override Later modules may extend validation while preserving bounds, field allowlists, and error behavior.
 */
module.exports = {
    /** Initializes the API contract service. */
    init: function () { return Promise.resolve(true); },
    /** Completes the API contract service initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the authoritative BackOffice API contract definitions. */
    getContracts: function () { return contracts; },
    /** Returns whether a value is a non-empty bounded string. */
    isString: function (value, maxLength = 256) { return typeof value === 'string' && value.length > 0 && value.length <= maxLength; },
    /** Returns whether a list contains unique bounded strings. */
    isStringList: function (value, maxItems = 128) {
        return Array.isArray(value) && value.length <= maxItems && value.every(item => this.isString(item, 256)) && new Set(value).size === value.length;
    },
    /** Validates one bounded navigation group declaration. */
    validateNavigationGroup: function (group) {
        return group && typeof group === 'object' && !Array.isArray(group) &&
            !Object.keys(group).some(key => !['id', 'label', 'labelKey', 'order'].includes(key)) &&
            this.isString(group.id, 128) && this.isString(group.label) &&
            (group.labelKey === undefined || this.isString(group.labelKey)) &&
            (group.order === undefined || Number.isInteger(group.order));
    },
    /** Validates one non-executable badge-provider reference. */
    validateNavigationBadgeProvider: function (provider) {
        return provider && typeof provider === 'object' && !Array.isArray(provider) &&
            !Object.keys(provider).some(key => !['moduleName', 'operationId'].includes(key)) &&
            contracts.moduleName.pattern && new RegExp(contracts.moduleName.pattern).test(provider.moduleName || '') &&
            this.isString(provider.operationId);
    },
    /** Validates bounded module-owned navigation metadata and hierarchy. */
    validateNavigation: function (navigation) {
        if (!Array.isArray(navigation) || navigation.length > 64) return false;
        let allowedContexts = ['environment', 'tenant', 'enterprise', 'site', 'catalog'];
        let allowedFeatureStates = ['ACTIVE', 'PREVIEW', 'DISABLED', 'HIDDEN'];
        let ids = navigation.map(item => item && item.id);
        if (ids.some(id => !this.isString(id, 128)) || new Set(ids).size !== ids.length) return false;
        if (!navigation.every(item => item && !Object.keys(item).some(key =>
            !['id', 'label', 'route', 'icon', 'order', 'requiredPermissions', 'labelKey', 'parentId',
                'group', 'perspectives', 'contexts', 'featureState', 'badgeProvider'].includes(key)) &&
            this.isString(item.label) && (item.route === undefined || this.isString(item.route, 512)) &&
            (item.order === undefined || Number.isInteger(item.order)) &&
            (item.icon === undefined || this.isString(item.icon, 64)) &&
            (item.labelKey === undefined || this.isString(item.labelKey)) &&
            (item.parentId === undefined || this.isString(item.parentId, 128) && item.parentId !== item.id) &&
            (item.group === undefined || this.validateNavigationGroup(item.group)) &&
            (item.perspectives === undefined || this.isStringList(item.perspectives, 16)) &&
            (item.contexts === undefined || this.isStringList(item.contexts, 8) &&
                item.contexts.every(context => allowedContexts.includes(context))) &&
            (item.featureState === undefined || allowedFeatureStates.includes(item.featureState)) &&
            (item.badgeProvider === undefined || this.validateNavigationBadgeProvider(item.badgeProvider)) &&
            (item.requiredPermissions === undefined || this.isStringList(item.requiredPermissions)))) return false;
        let byId = Object.fromEntries(navigation.map(item => [item.id, item]));
        if (navigation.some(item => item.parentId && !byId[item.parentId])) return false;
        return navigation.every(item => {
            let visited = new Set([item.id]);
            let parentId = item.parentId;
            while (parentId) {
                if (visited.has(parentId)) return false;
                visited.add(parentId);
                parentId = byId[parentId] && byId[parentId].parentId;
            }
            return true;
        });
    },
    /** Validates optional module-owned BackOffice catalogue metadata. */
    validateBackofficeMetadata: function (metadata) {
        if (metadata === undefined) return true;
        if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return false;
        let allowed = ['enabled', 'capabilityId', 'displayName', 'category', 'icon', 'contractVersion',
            'minimumClientContractVersion', 'roles', 'discovery', 'uiComposition', 'requiredPermissions', 'navigation'];
        if (Object.keys(metadata).some(key => !allowed.includes(key))) return false;
        if (metadata.enabled !== undefined && typeof metadata.enabled !== 'boolean') return false;
        if (['capabilityId', 'displayName', 'category', 'icon'].some(key => metadata[key] !== undefined && !this.isString(metadata[key]))) return false;
        if (['contractVersion', 'minimumClientContractVersion'].some(key => metadata[key] !== undefined &&
            (!Number.isInteger(metadata[key]) || metadata[key] < 1))) return false;
        if (metadata.requiredPermissions !== undefined && !this.isStringList(metadata.requiredPermissions)) return false;
        let roleValues = contracts.moduleRole.enum;
        if (metadata.roles !== undefined && (!this.isStringList(metadata.roles, roleValues.length) ||
            metadata.roles.some(role => !roleValues.includes(role)))) return false;
        if (metadata.discovery !== undefined && (!metadata.discovery || typeof metadata.discovery !== 'object' ||
            Array.isArray(metadata.discovery) || Object.keys(metadata.discovery).some(key => !['openApiPath', 'contractVersion'].includes(key)) ||
            (metadata.discovery.openApiPath !== undefined && (!this.isString(metadata.discovery.openApiPath, 512) ||
                !metadata.discovery.openApiPath.startsWith('/'))) || (metadata.discovery.contractVersion !== undefined &&
                (!Number.isInteger(metadata.discovery.contractVersion) || metadata.discovery.contractVersion < 1)))) return false;
        if (metadata.uiComposition !== undefined && (!metadata.roles || !metadata.roles.includes('UI_COMPOSITION_PROVIDER') ||
            !metadata.uiComposition || typeof metadata.uiComposition !== 'object' || Array.isArray(metadata.uiComposition) ||
            Object.keys(metadata.uiComposition).some(key => !['site', 'catalog', 'defaultPage', 'fallbackMode'].includes(key)) ||
            !['site', 'catalog', 'defaultPage'].every(key => this.isString(metadata.uiComposition[key])) ||
            metadata.uiComposition.fallbackMode !== 'STATIC_RECOVERY_SHELL')) return false;
        if (metadata.contractVersion !== undefined && metadata.minimumClientContractVersion !== undefined &&
            metadata.minimumClientContractVersion > metadata.contractVersion) return false;
        return metadata.navigation === undefined || this.validateNavigation(metadata.navigation);
    },
    /** Validates one module registration against the bounded API contract. */
    validateRegistration: function (registration) {
        if (!registration || typeof registration !== 'object' || Array.isArray(registration)) return false;
        let allowed = ['moduleName', 'instanceId', 'version', 'moduleKind', 'capabilities', 'clientCallable', 'endpoint',
            'healthPath', 'leaseTtlMs', 'runtime', 'backoffice'];
        return !Object.keys(registration).some(key => !allowed.includes(key)) &&
            contracts.moduleName.pattern && new RegExp(contracts.moduleName.pattern).test(registration.moduleName || '') &&
            this.isString(registration.instanceId, 512) && typeof registration.clientCallable === 'boolean' &&
            (registration.healthPath === undefined || this.isString(registration.healthPath, 512) &&
                registration.healthPath.startsWith('/') && !registration.healthPath.startsWith('//')) &&
            (registration.capabilities === undefined || this.isStringList(registration.capabilities, 256)) &&
            (registration.leaseTtlMs === undefined || Number.isInteger(registration.leaseTtlMs) && registration.leaseTtlMs >= 1000) &&
            (registration.runtime === undefined || registration.runtime && typeof registration.runtime === 'object' &&
                !Object.keys(registration.runtime).some(key => !['router', 'publish', 'web'].includes(key)) &&
                Object.keys(registration.runtime).every(key => typeof registration.runtime[key] === 'boolean')) &&
            this.validateBackofficeMetadata(registration.backoffice);
    },
    /** Validates one bounded runtime registration batch and its stable instance identity. */
    validateRegistrationBatch: function (batch, limit) {
        if (!batch || !this.isString(batch.instanceId, 512) || !Array.isArray(batch.registrations) ||
            batch.registrations.length === 0 || batch.registrations.length > Number(limit || 512)) return false;
        let allowed = ['instanceId', 'environment', 'server', 'node', 'registrations'];
        let moduleNames = batch.registrations.map(registration => registration.moduleName);
        return !Object.keys(batch).some(key => !allowed.includes(key)) &&
            (batch.environment === undefined || this.isString(batch.environment)) &&
            (batch.server === undefined || this.isString(batch.server)) &&
            (batch.node === undefined || batch.node === null || this.isString(batch.node)) &&
            new Set(moduleNames).size === moduleNames.length && batch.registrations.every(registration =>
                registration.instanceId === batch.instanceId && this.validateRegistration(registration));
    }
};
