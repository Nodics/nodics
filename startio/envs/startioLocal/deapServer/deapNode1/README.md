# deapNode1

`deapNode1` is a local DEAP node module under `deapServer`.

Use this node for node-scoped data pipeline configuration and activation. Server-wide topology belongs in `deapServer`, and data behavior belongs in DEAP modules.

Node settings should remain explicit, observable, and safe to rebalance across sibling nodes.
