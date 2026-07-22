# cronServer

`cronServer` is the development cron server module for the `startio` application.

Use this module for dev-scoped scheduled-job server activation, server configuration, and runtime topology. Cron capability behavior belongs in the relevant reusable modules.

Server configuration should remain environment-scoped, explicit, and safe to replace in QA, pre-production, and production.
