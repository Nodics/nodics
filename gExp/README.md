# gExp

`gExp` is the Nodics backend experience-capability group. It composes reusable
API modules that support administrative, customer, partner, storefront, mobile,
and future client experiences while keeping frontend applications outside the
Nodics backend runtime.

## Modules

- `backoffice` owns the registry, discovery, catalogue, and bootstrap contract
  used by the separate Nodics Axis administration application.

## Boundary

This group owns backend/API composition only. It must not contain frontend
source, web bundles, static assets, or browser build tooling. Experience modules
consume Nodics-owned contracts and must not replace target-module authorization,
runtime configuration, topology, schemas, or business behavior.

Later project, environment, server, and node modules may override configuration
and replace individual service methods through the standard Nodics hierarchy.
