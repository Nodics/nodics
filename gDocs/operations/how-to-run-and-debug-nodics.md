# How To Run And Debug Nodics

This guide explains the common ways to start Nodics and debug startup or runtime behavior.

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

## Stop The Application

Use `Ctrl+C` in the terminal.

If a process does not stop, check for remaining Node processes and occupied ports before starting again.

