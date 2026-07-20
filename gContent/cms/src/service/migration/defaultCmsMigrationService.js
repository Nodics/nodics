/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/service/migration/defaultCmsMigrationService
 * @description Provides tenant-scoped preview, versioned apply, audit, idempotency, and rollback for CMS contract upgrades.
 * @layer service
 * @owner cms
 * @override Later modules may replace policy or transformation members while preserving preview safety and audited rollback.
 */
module.exports = {
    /** Returns effective layered CMS migration policy. */
    getPolicy: function () { return (CONFIG.get('cms') || {}).migration || {}; },
    /** Resolves the migration tenant without crossing request authorization. */
    getTenant: function (request) { return request.tenant || CONFIG.get('defaultTenant') || 'default'; },
    /** Resolves the authenticated migration actor. */
    getActor: function (request) {
        let auth = request.authData || {};
        return auth.loginId || auth.serviceId || auth.code || auth.userId;
    },
    /** Builds a generated-service request preserving tenant and authenticated actor context. */
    serviceRequest: function (request, additions) {
        return Object.assign({ tenant: this.getTenant(request), authData: request.authData, options: { recursive: false } }, additions || {});
    },
    /** Loads the bounded CMS state required to compute migration changes. */
    loadState: async function (request) {
        let results = await Promise.all([
            SERVICE.DefaultCmsTypeCodeService.get(this.serviceRequest(request, { query: {} })),
            SERVICE.DefaultCmsTypeCode2RendererService.get(this.serviceRequest(request, { query: {} })),
            SERVICE.DefaultCmsPageService.get(this.serviceRequest(request, { query: {} })),
            SERVICE.DefaultCmsComponentService.get(this.serviceRequest(request, { query: {} })),
            SERVICE.DefaultCmsComponentDetailService.get(this.serviceRequest(request, { query: {} })),
            SERVICE.DefaultCmsPageRouteService.get(this.serviceRequest(request, { query: {} }))
        ]);
        let names = ['types', 'renderers', 'pages', 'components', 'associations', 'routes'];
        return names.reduce((state, name, index) => { state[name] = results[index].result || []; return state; }, {});
    },
    /** Normalizes a populated or scalar reference into its code. */
    codeOf: function (value) { return value && typeof value === 'object' ? value.code : value; },
    /** Builds deterministic type-authority backfill changes and reports conflicting usage. */
    buildTypeChanges: function (state, manualActions) {
        let pageTypes = new Set(state.pages.map(page => this.codeOf(page.typeCode)).filter(Boolean));
        let componentTypes = new Set(state.components.map(component => this.codeOf(component.typeCode)).filter(Boolean));
        return state.types.reduce((changes, type) => {
            let inPages = pageTypes.has(type.code), inComponents = componentTypes.has(type.code);
            if (inPages && inComponents) {
                manualActions.push({ reason: 'TYPE_AUTHORITY_CONFLICT', schema: 'cmsTypeCode', code: type.code });
                return changes;
            }
            let kind = inPages ? 'PAGE' : 'COMPONENT';
            let version = this.getPolicy().version || 1;
            if (type.kind !== kind || type.contractVersion !== version) changes.push({ schema: 'cmsTypeCode', operation: 'UPDATE', code: type.code, from: { kind: type.kind, contractVersion: type.contractVersion }, to: { kind: kind, contractVersion: version } });
            return changes;
        }, []);
    },
    /** Builds logical renderer-key migrations from explicit layered mappings. */
    buildRendererChanges: function (state, manualActions) {
        let mappings = this.getPolicy().rendererMappings || {};
        return state.renderers.reduce((changes, renderer) => {
            let target = mappings[renderer.renderer];
            let looksExecutable = /[\\/]|^(https?|javascript|data|file):/i.test(renderer.renderer || '');
            if (!target && looksExecutable) manualActions.push({ reason: 'RENDERER_MAPPING_REQUIRED', schema: 'cmsTypeCode2Renderer', code: renderer.code, renderer: renderer.renderer });
            if (target && target !== renderer.renderer) changes.push({ schema: 'cmsTypeCode2Renderer', operation: 'UPDATE', code: renderer.code, from: { renderer: renderer.renderer, contractVersion: renderer.contractVersion }, to: { renderer: target, contractVersion: 1 } });
            return changes;
        }, []);
    },
    /** Builds slot defaults and deterministic per-source/slot ordering changes. */
    buildAssociationChanges: function (state) {
        let grouped = {};
        state.associations.forEach(item => {
            let slot = item.slot || 'default';
            let key = item.source + '|' + slot;
            (grouped[key] = grouped[key] || []).push(item);
        });
        let changes = [];
        Object.keys(grouped).sort().forEach(key => grouped[key].sort((a, b) => (a.index || 0) - (b.index || 0) || String(a.code).localeCompare(String(b.code))).forEach((item, index) => {
            let slot = item.slot || 'default';
            if (item.slot !== slot || item.index !== index) changes.push({ schema: 'cmsComponentDetail', operation: 'UPDATE', code: item.code, from: { slot: item.slot, index: item.index }, to: { slot: slot, index: index } });
        }));
        return changes;
    },
    /** Builds route creation changes only from explicit project-owned mappings. */
    buildRouteChanges: function (state, manualActions) {
        let existing = new Set(state.routes.map(route => [route.site, route.path, route.locale, route.channel].join('|')));
        let mappings = this.getPolicy().routeMappings || [];
        let changes = mappings.filter(route => !existing.has([route.site, route.path, route.locale || 'default', route.channel || 'web'].join('|'))).map(route => ({ schema: 'cmsPageRoute', operation: 'CREATE', code: route.code, from: null, to: Object.assign({ active: true, locale: 'default', channel: 'web', deliveryState: 'DRAFT', accessMode: 'AUTHENTICATED' }, route) }));
        let routedPages = new Set(state.routes.map(route => this.codeOf(route.page)).concat(mappings.map(route => this.codeOf(route.page))));
        state.pages.filter(page => !routedPages.has(page.code)).forEach(page => manualActions.push({ reason: 'ROUTE_MAPPING_REQUIRED', schema: 'cmsPage', code: page.code }));
        (this.getPolicy().identifierMappings || []).forEach(mapping => manualActions.push({ reason: 'IDENTIFIER_CASCADE_REVIEW_REQUIRED', mapping: mapping }));
        return changes;
    },
    /** Computes the complete safe and idempotent CMS migration preview. */
    buildPreview: function (state) {
        let manualActions = [];
        let changes = [].concat(this.buildTypeChanges(state, manualActions), this.buildRendererChanges(state, manualActions), this.buildAssociationChanges(state), this.buildRouteChanges(state, manualActions));
        return { migrationVersion: this.getPolicy().version || 1, changes: changes, changeCount: changes.length, manualActions: manualActions, manualActionCount: manualActions.length, idempotent: changes.length === 0 };
    },
    /** Returns a non-mutating CMS migration preview. */
    previewMigration: async function (request) { return { code: 'SUC_SYS_00000', data: this.buildPreview(await this.loadState(request)) }; },
    /** Resolves the generated service authoritative for one migration schema. */
    serviceFor: function (schema) {
        return { cmsTypeCode: SERVICE.DefaultCmsTypeCodeService, cmsTypeCode2Renderer: SERVICE.DefaultCmsTypeCode2RendererService, cmsComponentDetail: SERVICE.DefaultCmsComponentDetailService, cmsPageRoute: SERVICE.DefaultCmsPageRouteService }[schema];
    },
    /** Applies one previewed change through its existing generated schema service. */
    applyChange: function (request, change) {
        let service = this.serviceFor(change.schema);
        if (!service) return Promise.reject(new CLASSES.NodicsError('CMS_MIGRATION_SCHEMA_UNSUPPORTED', 'Unsupported migration schema'));
        if (change.operation === 'CREATE') return service.save(this.serviceRequest(request, { model: change.to }));
        return service.update(this.serviceRequest(request, { query: { code: change.code }, model: { $set: change.to } }));
    },
    /** Persists a redacted CMS migration audit record. */
    saveAudit: function (request, model) { return SERVICE.DefaultCmsMigrationAuditService.save(this.serviceRequest(request, { model: model })); },
    /** Applies the current migration change set and records success or failure. */
    applyMigration: async function (request) {
        let preview = this.buildPreview(await this.loadState(request));
        let auditCode = 'cmsMigration_' + this.getTenant(request) + '_' + Date.now();
        let audit = { code: auditCode, active: true, migrationVersion: preview.migrationVersion, status: 'APPLYING', tenant: this.getTenant(request), requestedBy: this.getActor(request), preview: preview, snapshot: { changes: preview.changes.map(change => ({ schema: change.schema, operation: change.operation, code: change.code, from: change.from })) }, correlationId: request.correlationId };
        await this.saveAudit(request, audit);
        try {
            for (let change of preview.changes) await this.applyChange(request, change);
            audit.status = preview.idempotent ? 'NO_CHANGES' : 'APPLIED';
            audit.result = { changed: preview.changeCount, manualActions: preview.manualActionCount };
            await SERVICE.DefaultCmsMigrationAuditService.update(this.serviceRequest(request, { query: { code: auditCode }, model: { $set: { status: audit.status, result: audit.result } } }));
            return { code: 'SUC_SYS_00000', data: audit };
        } catch (error) {
            await SERVICE.DefaultCmsMigrationAuditService.update(this.serviceRequest(request, { query: { code: auditCode }, model: { $set: { status: 'FAILED', result: { failure: { code: error.code || 'CMS_MIGRATION_FAILED', message: 'CMS migration failed; inspect correlated diagnostics' } } } } })).catch(() => false);
            throw error;
        }
    },
    /** Restores audited update values and removes route records created by the migration. */
    rollbackMigration: async function (request) {
        let auditCode = request.cmsMigration && request.cmsMigration.auditCode;
        if (!auditCode) throw new CLASSES.NodicsError('CMS_MIGRATION_AUDIT_REQUIRED', 'auditCode is required');
        let result = await SERVICE.DefaultCmsMigrationAuditService.get(this.serviceRequest(request, { query: { code: auditCode } }));
        let audit = result.result && result.result[0];
        if (!audit || !audit.snapshot || !Array.isArray(audit.snapshot.changes)) throw new CLASSES.NodicsError('CMS_MIGRATION_AUDIT_NOT_FOUND', 'Migration audit snapshot was not found');
        if (audit.status === 'ROLLED_BACK') return { code: 'SUC_SYS_00000', data: { auditCode: auditCode, status: 'ROLLED_BACK', idempotent: true } };
        for (let change of audit.snapshot.changes.slice().reverse()) {
            let service = this.serviceFor(change.schema);
            if (change.operation === 'CREATE') await service.remove(this.serviceRequest(request, { query: { code: change.code } }));
            else await service.update(this.serviceRequest(request, { query: { code: change.code }, model: { $set: change.from || {} } }));
        }
        await SERVICE.DefaultCmsMigrationAuditService.update(this.serviceRequest(request, { query: { code: auditCode }, model: { $set: { status: 'ROLLED_BACK', result: { restored: audit.snapshot.changes.length } } } }));
        return { code: 'SUC_SYS_00000', data: { auditCode: auditCode, status: 'ROLLED_BACK', restored: audit.snapshot.changes.length } };
    }
};
