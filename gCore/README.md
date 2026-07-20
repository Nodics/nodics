# gCore

`gCore` groups reusable business capabilities that many Nodics applications
need regardless of industry. These modules sit above the framework runtime:
they use Nodics configuration, security, database, event, and pipeline contracts
without replacing those framework authorities.

## Module Family

| Capability | Module | Use it for |
| --- | --- | --- |
| Identity and tenancy | [profile](profile/README.md) | Enterprises, tenants, people, groups, credentials, login, and service identities |
| Scheduled work | [cronjob](cronjob/README.md) | Governed recurring and requested background jobs |
| Events | [nems](nems/README.md) | Business-event management over the framework messaging contracts |
| Long-running processes | [workflow](workflow/README.md) | State, actions, channels, retries, and process continuation |
| Reference application patterns | [quizer](quizer/README.md) | Sample quiz capability family; qualify it for project use before production |

## Ownership Rule

Choose a `gCore` module when the business capability is broadly reusable. Keep
provider mechanics in `gFramework`, project-specific policy in later project or
environment layers, and client UI code in a separate application. Modules may
collaborate through their published contracts, but one module must remain the
authority for each record, policy, and lifecycle.

## Continue

- Business overview: [Business Capabilities And Outcomes](../gDocs/business/business-capabilities-and-outcomes.md)
- Capability maturity: [Provider And Capability Maturity Matrix](../gDocs/reference/provider-capability-maturity-matrix.md)
- Module index: [Module Documentation Index](../gDocs/reference/module-documentation-index.md)
