# How To Approve And Publish Content

This guide explains the implemented Nodics content-publishing flow in plain
language. It is for business users who manage content, operators who configure
Staged and Online systems, and developers who customize publishing.

## What This Capability Does

Nodics keeps editable content away from the public Online system. A content
editor works in **Staged**, sends a complete change set for review, and an
approved workflow publishes one immutable release to **Online**. A rejected
change does not alter Online content. An operator can roll back to the previous
deployed release.

The current backend capability is implemented and tested. A BackOffice visual
client is not part of this implementation yet; an authorized client can invoke
the same module APIs and workflow contracts later without changing their
authority.

## The Business Journey

1. An editor creates or updates pages, routes, components, templates, or slots
   in Staged.
2. Nodics retains exact versions of the changed records.
3. The editor groups the affected records in a workflow carrier and identifies
   the page route to release.
4. Reviewers approve or reject the existing WCMS workflow.
5. Rejection ends the release without changing Online.
6. Approval invokes the existing `nPublish` lifecycle automatically.
7. CMS validates the exact dependency graph and creates an immutable manifest.
8. Staged sends that manifest to the separately deployed Online CMS using an
   internal module token.
9. Online verifies and stores the manifest, switches its active pointer, clears
   its delivery cache, and records a deployment receipt.
10. Public delivery reads only the active Online manifest when manifest delivery
    is enabled.

Replaying the same approved release is safe and does not create a duplicate
deployment receipt. Restarting Online does not lose the active release because
the pointer and manifests are persisted.

## Responsibilities And Authority

| Capability | Authority |
| --- | --- |
| Review steps and approval decision | `gContent/wcms` using the existing workflow engine |
| Generic publication states, revisions, journal, and audit projection | `gFramework/nPublish` |
| CMS dependency rules and immutable delivery snapshot | `gContent/cms` |
| Editable content versions | Staged versioned database variants |
| Deployed manifests and active delivery pointer | Online CMS database |
| Human login and permissions | Profile and the normal user authentication flow |
| Staged-to-Online deployment | Internal module authentication, never a human password |

Do not add a second workflow engine, publication state machine, version store,
or Online pointer. Project code should extend these owners.

## Configure The Two Systems

Staged and Online must be independent deployments with different databases.
The supplied local examples are:

- `startioLocalCmsServer` on port `3040`, database `startioCmsStaged`;
- `startioLocalCmsOnlineServer` on port `3070`, database
  `startioCmsOnline`.

The Staged environment activates the existing publish/version variants:

```js
module.exports = {
    publishEnabled: true,
    activeModules: {
        modules: ['cms', 'wcms', 'workflow', 'publish', 'myCmsStagedServer']
    },
    database: {
        default: { mongodb: { master: { databaseName: 'myCmsStaged' } } }
    },
    cms: {
        publication: {
            runtimeRole: 'STAGED',
            targetTransportProvider: 'DefaultCmsPublicationModuleTransportService',
            target: {
                moduleName: 'cms',
                connectionName: 'cmsOnline',
                connectionType: 'server',
                timeoutMs: 30000,
                maxAttempts: 3
            }
        }
    },
    servers: {
        cmsOnline: {
            options: { contextRoot: 'nodics' },
            endpoint: { httpHost: 'online-cms', httpPort: 3070 }
        }
    }
};
```

`moduleName` remains `cms`, because that is the API path and capability owner.
`connectionName` selects the separately configured Online endpoint. Do not use
the default or self connection as the publication target.

The Online environment must not activate version variants:

```js
module.exports = {
    publishEnabled: false,
    activeModules: { modules: ['cms', 'myCmsOnlineServer'] },
    database: {
        default: { mongodb: { master: { databaseName: 'myCmsOnline' } } }
    },
    cms: {
        publication: {
            enabled: true,
            runtimeRole: 'ONLINE',
            targetTransportProvider: null
        }
    }
};
```

Here, `cms.publication.enabled` selects manifest-based Online delivery. Enable
it only after an initial manifest is available; missing pointers fail closed.
The Online runtime also rejects target mutations if `publishEnabled` is true.

## Select Which Schemas Are Versioned

Versioning is opt-in at module/schema level. A Staged catalog or CMS schema can
set `isVersionedEnabled: true` through its layered schema configuration while
unrelated schemas, such as users, remain non-versioned. The Online deployment
uses the ordinary non-versioned schemas and stores only deployed target forms.

Do not copy base schemas merely to add common properties. Nodics merges base
schema properties at runtime; override only the setting or business property
that differs.

## Start A Content Approval

The implemented WCMS bridge expects:

- `workflowCarrier.items`: every content identity associated with the review,
  including `schemaName`, stable `code`, and `versionId`;
- `workflowCarrier.sourceDetail.schemaName`: the workflow source schema;
- `workflowCarrier.sourceDetail.publication`: the release definition with
  `code`, `domain`, `rootType`, `rootCode`, and `sourceVersion`.

For CMS page publishing, use `domain: 'cms'` and the default
`rootType: 'pageRoute'`. The route is the release root; CMS resolves its exact
page, component, association, component, template, and slot dependencies.
Missing release input or missing exact versions fails closed.

Business clients should show the editor the complete affected-item list before
submission. The approval decision applies to that frozen release scope, not to
whatever content happens to be latest later.

## Customize The Workflow

Projects can layer new reviewers, actions, and channels over the existing WCMS
workflow data. Keep the final automatic action connected only to the successful
approval path. A rejection path must never call publication activation.

Project-specific content types, renderer keys, templates, and sample data belong
in the project module. Reusable CMS must not contain one customer's page model
or executable frontend paths.

## Extend Publishing To Another Domain

Developers should reuse `nPublish` and contribute domain-specific providers:

1. A domain adapter that loads exact versions, resolves a bounded dependency
   graph, validates business rules, and performs post-activation hooks.
2. A version provider that reads the current Online version, activates one
   immutable target release, and rolls back to a previously deployed version.
3. A target adapter and transport that use internal authentication, idempotency,
   bounded retries, integrity checks, and a separate Online authority.
4. Layered `publish.providers.domainAdapters` and `versionProviders`
   configuration that maps the domain to those services.

Product catalogs should follow this extension path rather than creating a
parallel staging/publishing framework.

## Security And Operations Checklist

- Keep Staged authoring APIs behind human authentication and permissions.
- Use only internal module tokens for Staged-to-Online calls; never forward a
  username/password credential.
- Mark target APIs as service-token-only. Human access tokens remain rejected
  even when the human principal has a broad administrative permission.
- Give Staged network access only to the required Online internal endpoints.
- Keep Staged and Online database credentials and schemas separate.
- Monitor publication state, revision, correlation ID, immutable journal, audit
  projection, target receipt, transport retries, latency, and circuit state.
- Alert on repeated `FAILED` transitions, unavailable Online targets, stale
  pointers, reconciliation failures, and unsupported manifest versions.
- Back up both authorities. Restoring Staged alone does not recreate the active
  Online pointer, and restoring Online alone does not recreate authoring history.

If Online is unavailable, the approved attempt ends in an auditable `FAILED`
state and the previous Online pointer remains active. After Online recovers,
create a new publication request for the same source version. Nodics does not
rewrite a terminal failure because its history is operational evidence.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Publication fails before deployment | Exact source versions, dependency limits, renderer keys, and workflow release input |
| Target connection is unavailable | `servers.<connectionName>`, host/port, internal token readiness, timeout, retry, and circuit diagnostics |
| Online rejects deployment | `runtimeRole: 'ONLINE'`, `publishEnabled: false`, manifest size, integrity, and supported contract version |
| Online returns no page | Active pointer for tenant/site/path/locale/channel/access mode and `cms.publication.enabled` rollout order |
| A rejected change appears Online | Verify the workflow graph: only the approved terminal action may call nPublish |
| Rollback is unavailable | A previous Online manifest must have been deployed and captured by the later publication |

## Verify A Change

Run focused contracts first:

```bash
node gFramework/nPublish/test/publicationLifecycleService.test.js
node gFramework/nPublish/test/publicationAtomicAuditContract.test.js
node gFramework/nPublish/test/publicationAuditReconciliationService.test.js
node gContent/cms/test/cmsPublicationManifestContract.test.js
node gContent/wcms/test/wcmsPublicationWorkflowContract.test.js
```

Build the Staged server so generated version-aware services match its active
module set, then run the real modular topology proof:

```bash
env SERVER=startioLocalCmsServer npm run build
npm run test:topology:modular
```

The modular test verifies separate processes and databases, approval,
rejection, replay idempotency, a second release, target restart recovery, and
rollback. Also run the repository's normal documentation, generated-context,
and regression suites before release.

## Related Detail

- [CMS publication manifest contract](../../gContent/cms/docs/publication-manifest-contract.md)
- [WCMS approval-to-publication contract](../../gContent/wcms/docs/README.md)
- [nPublish lifecycle contract](../../gFramework/nPublish/docs/README.md)
- [How users, tenants, and permissions work](../security/how-users-tenants-and-permissions-work.md)
- [How to test Nodics changes](../testing/how-to-test-nodics-changes.md)

## Continue

- Security: [How Users, Tenants, And Permissions Work](../security/how-users-tenants-and-permissions-work.md)
- Operations: [How To Run And Debug Nodics](../operations/how-to-run-and-debug-nodics.md)
- Testing: [How To Test Nodics Changes](../testing/how-to-test-nodics-changes.md)
- Documentation home: [Nodics Documentation](../README.md)
