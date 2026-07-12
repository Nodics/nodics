# Nodics Principles Contract

Nodics is an enterprise application platform and application factory.

The core rule is: capabilities are sacred, implementations are negotiable.

Every feature must respect the layered module hierarchy. Framework modules
provide default behavior; project, environment, server, node, tenant, and
customer modules can override schemas, services, routers, pipelines, data,
tests, configuration, and runtime behavior without changing out-of-the-box
Nodics code.

Nothing reusable should be hardcoded to a specific project. Behavior must come
from active modules, configuration, tenant context, schema definitions, runtime
governance, and declared extension contracts.

Generated artifacts must be recreated from source definitions during build and
cleaned safely during clean.

Security, access control, validation, audit, rollback, diagnostics, and test
coverage are platform contracts. New code must preserve multi-tenancy, modular
deployment, runtime configurability, traceability, backward compatibility, and
customization through hierarchy.
