# wcms Module

`wcms` owns workflow-enabled CMS behavior. It depends on `cms` and adds the module space for content workflows, workflow-aware schemas, services, pipelines, interceptors, and tests.

Use this module when content behavior needs workflow governance. Plain content structures and CMS lifecycle behavior belong in `gContent/cms`.

Workflow content changes must preserve source definitions, validation, auditability, tenant isolation, and rollback expectations.

The existing CMS page and component approval workflows now route successful
manual review into an automatic publication action. The action reuses nPublish
to validate the associated immutable release, record workflow approval, and
deploy it through the configured Staged-to-Online CMS transport. Rejection and
error channels continue using the existing workflow terminal authorities.

Every mutable CMS authoring schema is associated with one of the default page
or component approval flows. A save creates an unreleased carrier containing
the changed immutable version. The business user or BackOffice process may add
other affected items and the target page-route release definition before
releasing the carrier. Only the successful terminal approval channel invokes
`nPublish`; rejection and errors never deploy content.

Projects may add manual, automatic, parallel, external API, or AI-assisted
actions by overriding workflow action/channel initializer data. They must keep
the final publish action behind successful approval and preserve the existing
workflow and `nPublish` authorities.
