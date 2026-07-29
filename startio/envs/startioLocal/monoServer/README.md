# monoServer

`monoServer` is the primary local server module for the `startio` application.

Use this module for local server activation, node composition, route/service availability, and runtime topology. Business behavior belongs in active application or framework modules.

Local server settings should stay explicit and replaceable by higher environment server modules.

For local Assistant acceptance, this server only selects process composition
and the active provider adapter required by the local `assistantGeneration`
profile. Assistant definitions, prompts, tool-policy records, provider
defaults, and reusable business capability data remain owned by their source
modules, such as `gAi/aiAssistant` and `gAi/aiProviders`.

Do not copy full Assistant policy blocks, provider definitions, or reusable
capability data into `monoServer`. If local behavior needs a different
activation, contribute only the smallest server-owned override that is not
available in the owning module or environment layer.
