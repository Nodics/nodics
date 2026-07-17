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

Cron behavior must stay source-definition driven. Project modules add or
override schedules, handlers, services, and configuration through later layers
rather than editing core cronjob code.

## CronJob Model

A CronJob is a persisted scheduled task with trigger and handler behavior. The model applies through schemas,
services, routes, logs, node ownership, and tests.

A CronJob definition describes:

- code/name and active state;
- trigger or schedule;
- handler/service to execute;
- tenant/request context expectations;
- node/server ownership;
- run-on-startup behavior;
- permission requirements for lifecycle routes;
- logging and diagnostics;
- retry/failure behavior.

Do not rely on startup side effects to create duplicate jobs. Startup
initialization must be idempotent.

## Lifecycle Operations

CronJob lifecycle operations include:

- create or register a job;
- start scheduling;
- stop or pause scheduling;
- resume scheduling;
- run on demand when allowed;
- update the persisted definition;
- remove or deactivate the job;
- inspect logs and failure state.

Each operation routes through the owning service and is protected by the
right permission and tenant context. Route handlers do not contain the
business behavior directly.

Lifecycle APIs are command APIs. CronJob route definitions must use `POST` for
create/register, run, start, stop, pause, and resume commands, `PATCH` for
updates, and `DELETE` for removal. Do not expose state-changing CronJob
operations through `GET`.

## Handlers And Project Overrides

Handlers resolve execution context and call the owning service. The
service contains the real business behavior so tests can run without
waiting for wall-clock schedules.

Projects can override handlers, schedules, configuration, and services through
later modules. A customer-specific scheduled task belongs in the customer
project module, while reusable scheduler behavior belongs in `cronjob`.

## Runtime Contract

Cron lifecycle behavior must preserve scheduling state, tenant/request context
where applicable, diagnostics, retry/error handling, and tests for both default
behavior and later-module customization.
