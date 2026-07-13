# nNms

`nNms` is the node management service capability. It owns node configuration services, node state handlers, node up/down processing, related events, and management routes.

Use this module for framework-level node lifecycle behavior. Environment-specific topology and operational policy should come from layered configuration and active modules.

Node management changes must keep runtime state observable, auditable, and safe for distributed deployments. Do not hardcode server, node, tenant, or environment assumptions in framework code.
