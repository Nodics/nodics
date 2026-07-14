# startioLocalDeapNode2

`startioLocalDeapNode2` is a local DEAP node module under `startioLocalDeapServer`.

Use this node for node-scoped data pipeline configuration and activation. Server-wide topology belongs in `startioLocalDeapServer`, and data behavior belongs in DEAP modules.

Node settings should remain explicit, observable, and safe to rebalance across sibling nodes.
