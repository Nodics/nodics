# Module Structure Contract

Every Nodics module and submodule should be easy for humans and AI agents to
discover, understand, customize, and validate.

Standard structure:

```text
module/
  AGENTS.md
  README.md
  package.json
  config/
  docs/
  llm/
    README.md
    contracts/
    examples/
    generated/
  src/
  test/
```

`README.md` is the human entrypoint. `AGENTS.md` is the AI/developer behavior
contract. `docs/` contains permanent module documentation. `llm/` contains
AI-specific guidance, examples, contracts, and generated context.

`llm/contracts/` and `llm/examples/` are maintained source folders, not
generated output. AI tools and developers must update them when functionality
changes the module contract or recommended customization pattern.

Aggregator modules and their child modules follow the same convention. For
example, `nCache`, `nCache/cache`, `nCache/redisCache`, `nCache/nodeCache`, and
`nCache/hazelcastCache` are independent module boundaries and must link their
guidance through the hierarchy.

Customer/project modules follow the same shape. Customer customization must be
implemented in project modules and layered overrides, not by editing Nodics
framework modules.
