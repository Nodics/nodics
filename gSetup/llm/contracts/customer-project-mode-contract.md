# Customer Project Mode Contract

When an AI agent works in a customer project built on Nodics, the default scope
is the customer/project module hierarchy only.

Do not inspect or modify Nodics framework code unless the developer explicitly
asks for framework work.

Customer behavior must be customized through project modules, environment
modules, server modules, node modules, layered configuration, schemas, routers,
services, pipelines, data, and tests.

If a requested change appears to require editing Nodics framework code, first
explain the available project-level extension points. Escalate to framework work
only when the developer confirms the framework itself must change.
