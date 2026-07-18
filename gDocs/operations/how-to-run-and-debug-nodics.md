# How To Run And Debug Nodics

This guide explains the common ways to start Nodics and debug startup or runtime behavior.

## Beginner Summary

Running Nodics means starting a selected project, environment, server, and
optional node. Debugging means slowing that startup or request execution enough
to see which configuration, module, route, service, provider, tenant, or
generated artifact is being used.

Before debugging, write down:

- command used to start;
- selected project;
- selected environment;
- selected server;
- selected node, if any;
- port;
- API path or job/import/event being tested.

Most runtime confusion comes from starting a different server or module set than
the one you expected.

## Start Normally

Run:

```bash
npm run start
```

Use normal startup when you want to run the application without attaching a debugger.

## Start And Pause For Debugging

Run:

```bash
npm run start:debug
```

This starts Node with the inspector and pauses before startup code executes.

Use this when:

- You need to debug startup configuration.
- You need a breakpoint before modules load.
- You want to inspect how configuration, schemas, routes, or services are registered.

Visual Studio Code can attach to port `9229` by default.

## Start And Attach Later

Run:

```bash
npm run start:inspect
```

This starts the application immediately and exposes the inspector.

Use this when:

- The issue happens after startup.
- You want the server running before attaching.
- You are debugging an API call, scheduled job, event, or import process.

## Using A Different Debug Port

Use a different port when running multiple processes:

```bash
npm run start:debug -- --port=9230
```

Each Node process must use its own inspector port.

## Visual Studio Code Attach

Use the attach configuration in `.vscode/launch.json`.

Default values:

- Address: `localhost`
- Port: `9229`
- Request type: `attach`

Steps:

1. Add breakpoints.
2. Run `npm run start:debug`.
3. Start the VS Code attach configuration.
4. Continue execution after the debugger attaches.

## Debugging Tips

For startup problems, place breakpoints near:

- Configuration loading.
- Module initialization.
- Schema loading.
- Route loading.
- Service loading.
- Initial data loading.

For request problems, place breakpoints near:

- Route controller.
- Authorization checks.
- Service method.
- Data access method.
- Response resolution.

For scheduled jobs, place breakpoints near:

- Job handler.
- Owning service method.
- Event or log writer.

## Where To Put Breakpoints

| Problem | Good breakpoint area |
| --- | --- |
| Wrong configuration value | Configuration loading and `CONFIG.get` caller |
| Module not active | Module initializer and selected server `activeModules` |
| Route not found | Router loading, router registration, generated route output |
| Unauthorized API | Header normalization, token validation, route authorization |
| Wrong tenant data | Tenant resolution, DAO/provider resolution, cache/search key creation |
| Controller receives wrong body | Controller request mapping |
| Business rule wrong | Owning service function |
| Generated API wrong | Source schema/router plus generator output |
| Import fails | Import initializer, file/header processing, target dispatch |
| Job does not run | CronJob container, node responsibility, job handler |
| Cache result wrong | Cache key creation, cache policy, invalidation service |

## Stop The Application

Use `Ctrl+C` in the terminal.

If a process does not stop, check for remaining Node processes and occupied ports before starting again.

## Beginner Troubleshooting

| Symptom | What to check first |
| --- | --- |
| Breakpoint never hits | Confirm the file is loader-visible and the selected module is active. |
| API returns 404 | Confirm context root, module name, API version, and route registration. |
| API returns 401 or 403 | Confirm token, tenant, route permission, and user group. |
| Data looks stale | Confirm cache and generated artifacts were refreshed. |
| Local server behaves differently than test | Confirm selected environment/server/node and runtime configuration. |
| Debugger cannot attach | Confirm inspector port is unique and the process is running with debug/inspect. |
