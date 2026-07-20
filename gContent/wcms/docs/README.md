# wcms Documentation

This folder contains permanent human-readable documentation for the `gContent/wcms` module boundary.

Keep architecture, runtime contracts, configuration behavior, operational notes, troubleshooting, and extension decisions here when they are too detailed for the module `README.md`.

Update this folder whenever module behavior, public contracts, security posture, lifecycle, or customization rules change.

## Approval-to-publication contract

WCMS retains the existing `cmsPagesApprovalFlowHead` and
`cmsComponentApprovalFlowHead` schema mappings and manual review actions. A
successful review now reaches a module-owned automatic publish action rather
than creating a second workflow engine.

The business user attaches the intended nPublish release definition to
`workflowCarrier.sourceDetail.publication`; `workflowCarrier.items` identifies
the content involved in the decision. The automatic action calls nPublish
create, validate, approve, and activate in order. nPublish creates the immutable
CMS manifest and the CMS transport deploys it to the separately configured
Online target. Missing release input fails closed.

The bridge has no public route. It can run only as the handler of the approved
workflow action. Human username/password authentication remains separate from
the internal module token used for Staged-to-Online deployment.

CMS schema changes create unreleased carriers and retain `versionId` on their
workflow items. This allows the business user to group the full affected change
set and declare the page-route release scope before starting approval. Later
modules may extend the action/channel graph, but successful approval must remain
the only path to the terminal publication action.

See the beginner and business-user guide at
[`gDocs/content/how-to-approve-and-publish-content.md`](../../../gDocs/content/how-to-approve-and-publish-content.md)
for the complete Staged-to-Online journey and configuration examples.
