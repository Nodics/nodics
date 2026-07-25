# gAi Architecture

Callers never interact with a vendor provider:

```text
aiAssistant ----\
                 > aiProviders gateway -> configured registered adapter
aiKnowledge ----/
```

Active modules determine which adapter code exists. Provider modules
self-register their normalized capabilities. Layered `aiProviders.profiles`
configuration selects an active registered provider and model for a named use
case. Configuration cannot activate code that is absent.

Target modules retain business authority, Workflow retains durable process
authority, nSearch retains search authority, and source modules retain their
data and publication authority.
