# cronjob

The `cronjob` capability owns scheduled execution, cron lifecycle services,
routes, persistence schemas, pipelines, interceptors, events, data, and tests.

## Configuration

Defaults live under `config/`; project, environment, server, and node modules may
override them through the normal module hierarchy.

## Customization

Extend scheduling through later-layer schemas, services, pipelines, events, and
configuration. Do not modify generated files directly.

## Developer Guidance

Cron guidance covers cron job schemas, job details, cron services, handlers,
lifecycle operations, and create/run/update/remove flows.

Cron behavior must stay source-definition driven. Project modules should add or
override schedules, handlers, services, and configuration through later layers
rather than editing core cronjob code.

## Runtime Contract

Cron lifecycle behavior must preserve scheduling state, tenant/request context
where applicable, diagnostics, retry/error handling, and tests for both default
behavior and later-module customization.
