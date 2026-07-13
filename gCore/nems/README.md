# NEMS

`nems` owns Nodics Event Management System distribution, persisted event
definitions, event logs, retry state, and cross-module event delivery.

NEMS stores published event definitions, distributes them to target modules,
records success in event logs, and keeps failed definitions for retry or manual
handling. Current implementation details must be verified from source.

## Ownership

NEMS is responsible for:

- event definition schemas;
- event log schemas;
- persisted event lifecycle;
- distributor services;
- retry/failure state;
- operational diagnostics;
- integration with framework `nEvent`.

## Event Lifecycle

A source module publishes an event through framework event services. NEMS may
persist the event definition, distribute it to the target module, and update the
definition or log based on the response.

Implementations must preserve tenant context, event traceability, sanitized
observability, retry limits, and manual recovery paths where configured.

## Extension Contract

Projects extend NEMS through later schemas, services, listeners, configuration,
and tests. Do not hardcode module names or target URLs in core event
distribution logic. Modular deployment behavior must be tested when event
delivery crosses runtime processes.
