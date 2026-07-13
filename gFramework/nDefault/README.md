# nDefault

`nDefault` provides foundational default schema and generated behavior used by the framework. It is a baseline capability module for default contracts that other modules can rely on.

Use this module for framework defaults that are intentionally generic and reusable. Module-specific defaults should stay with the module that owns the capability.

Changes here have broad impact. Keep defaults minimal, source-of-truth driven, and covered by tests so project layers can override behavior without modifying framework code.
