# kickoffLocalCronNode1

`kickoffLocalCronNode1` is a local cron node module under `kickoffLocalCronServer`.

Use this node for node-scoped local cron configuration and activation. Server-wide behavior belongs in `kickoffLocalCronServer`, and cron capability logic belongs in reusable modules.

Node settings should remain explicit, observable, and safe to rebalance across sibling nodes.
