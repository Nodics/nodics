# nNms

`nNms` is the node management service capability. It owns node state tracking, node health checks, node responsibility negotiation, node up/down event dispatch, node configuration helpers, and secured management route metadata.

Use this module for framework-level node lifecycle behavior. Environment-specific topology, server coordinates, node count, ping enablement, and operational policy must come from layered configuration and active modules.

## Capability

The module manages runtime awareness for modules that can run across multiple nodes.

It supports:

- node activation notification;
- node health checking;
- node active/inactive state updates;
- node responsibility requests;
- node up/down event publication;
- secured management routes for activation, responsibility, and health-check control.

This module does not decide which modules are active. Active module selection stays with configuration and startup hierarchy. `nNms` observes and coordinates node state for modules that are already active and router-enabled.

## Runtime Flow

Startup notification:

1. `notifyNodeStarted` reads configured pingable modules.
2. It checks whether each module is active and router-enabled.
3. It resolves configured nodes through router server configuration.
4. It notifies other active nodes using internal bearer token access.
5. It records active or inactive state through `DefaultNodeConfigurationService`.

Health check:

1. `checkActiveNodes` starts interval checks for configured pingable modules.
2. `checkActiveNode` pings remote nodes.
3. Success keeps the node active.
4. Failure marks the node inactive and calls `DefaultNodeStateChangeHandlerService.handleNodeInactive`.
5. Node state handlers publish `nodeUpEvent` and `nodeDownEvent` through the event service.

Responsibility:

1. `requestResponsibility` validates the requested node id.
2. It grants responsibility when the target node is not already handling the request or when the requester has lower node precedence.
3. It records responsibility state in the module runtime object.

## Source Contracts

- `config/properties.js` owns node management defaults such as `activateNodePing` and `nodePingTimeout`.
- `src/router/routers.js` owns secured management route metadata.
- `src/controller/defaultNodeManagerController.js` maps route calls to facade behavior.
- `src/facade/defaultNodeManagerFacade.js` delegates to node manager services.
- `src/service/node/defaultNodeManagerService.js` owns notification, health check, and responsibility behavior.
- `src/service/config/defaultNodeConfigurationService.js` owns module runtime node state mutation.
- `src/service/node/defaultNodeStateChangeHandlerService.js` owns node up/down event dispatch.
- `src/service/node/defaultNodeUpHandlerService.js` and `src/service/node/defaultNodeDownHandlerService.js` provide overrideable event handling hooks.

## Configuration

Default configuration:

```js
module.exports = {
    activateNodePing: false,
    nodePingTimeout: 10000
};
```

Projects, environments, servers, and nodes may override ping behavior through layered configuration. Do not hardcode server names, node ids, ports, tenants, or remote coordinates in node-management services.

## Extension Path

Projects may customize node management by:

- overriding ping enablement and timeout through configuration;
- contributing node/server topology through environment, server, and node modules;
- overriding node up/down handlers in later active modules;
- adding project-specific event reactions for node state changes;
- adding focused tests for responsibility or failover behavior.

Use this module for node lifecycle coordination, not for business ownership of scheduled jobs or distributed work. Business modules should define their own responsibility rules and use `nNms` state as supporting runtime context.

## Security

Node management routes are secured. Internal node-to-node calls use an internal bearer token resolved through Nodics token access for the configured default tenant.

Do not expose node management actions as public routes. Any project-specific operations UI should call secured APIs and preserve route permissions, tenant context, and sanitized diagnostics.

## Tests

The module currently has common and environment-local smoke tests. When changing node behavior, add focused tests for:

- route metadata and permission behavior;
- active/inactive state updates;
- missing or invalid node id rejection;
- responsibility grant/deny behavior;
- node up/down event dispatch;
- internal token request construction;
- multi-node topology behavior.

Run:

```bash
npm run test:topology
npm run test:basic
npm run quality:docs
```

## What To Avoid

Avoid:

- hardcoding project topology in framework node services;
- enabling node ping globally without environment/server/node intent;
- adding public unsecured node-management routes;
- treating inactive-node handling as business job ownership;
- hiding node failover behavior outside tests and diagnostics;
- bypassing internal token access for node-to-node calls.
