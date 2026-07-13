# nWeb

`nWeb` is the framework web capability placeholder for web-facing module contracts. In the current platform direction, framework core remains API-first; web behavior should be explicit and layered rather than assumed by backend modules.

Use this module only for reusable framework web contracts that genuinely belong in the platform. Product websites, marketing pages, and customer application UIs should live outside framework core unless explicitly introduced as active modules.

Keep web extensions governed by schemas, routers, services, access control, and tests. Do not let presentation concerns leak into unrelated backend capability modules.
