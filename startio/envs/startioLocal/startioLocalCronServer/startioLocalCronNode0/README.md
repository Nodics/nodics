# startioLocalCronNode0

`startioLocalCronNode0` is a local cron node module under `startioLocalCronServer`.

Use this node for node-scoped local cron configuration and activation. Server-wide behavior belongs in `startioLocalCronServer`, and cron capability logic belongs in reusable modules.

Node settings should remain explicit, observable, and safe to rebalance across sibling nodes.
