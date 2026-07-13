# flowSchema Module

`flowSchema` owns workflow schema definitions for the application workflow layer. It is the source-of-truth module for workflow data contracts consumed by `flowCore` and `flowApi`.

Use this module for schema and metadata changes. Runtime execution behavior belongs in `flowCore`, and API request handling belongs in `flowApi`.

Generated artifacts derived from workflow schemas must be regenerated rather than hand-maintained.
