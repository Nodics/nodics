# gframesLocalServer

`gframesLocalServer` is the local server module for the `gframes` application. It owns server-level startup topology and configuration for local execution.

Use this module for server-scoped module activation, router/service availability, and local runtime settings. Capability implementation belongs in the application modules or framework modules they extend.

Server settings should be explicit, environment-scoped, and safe to replace in higher environments.
