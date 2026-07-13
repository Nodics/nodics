# nbpm

`nbpm` is the framework workflow/process capability. It owns workflow schemas, workflow services, activity interceptors, event handling, carrier/item data builders, and workflow route contracts.

Use this module for generic business process behavior that belongs to the platform. Domain-specific processes should be contributed as workflow definitions and project modules layered above the framework.

Workflow changes must preserve source-of-truth definitions, validation, auditability, rollback safety, and test coverage because process behavior can coordinate multiple capabilities.
