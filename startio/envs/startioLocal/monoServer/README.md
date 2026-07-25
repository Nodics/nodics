# monoServer

`monoServer` is the primary local server module for the `startio` application.

Use this module for local server activation, node composition, route/service availability, and runtime topology. Business behavior belongs in active application or framework modules.

Local server settings should stay explicit and replaceable by higher environment server modules.

For local Assistant acceptance, this server enables the globally deny-by-default
read-tool boundary and contributes an enabled `axisAssistantReadOnly` policy
through explicit init data. The policy exposes only the BackOffice catalogue
read operation and the bounded Profile enterprise-search operation. Run init
import for both `aiAssistant` and `monoServer` after
policy changes. The local topology explicitly activates `openAiProvider`
because the `assistantGeneration` profile selects OpenAI; `gAi` intentionally
does not activate every vendor adapter. Provider credentials remain environment
secret references and are never stored here.
