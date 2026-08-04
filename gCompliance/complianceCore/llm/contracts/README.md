# Compliance core contracts

- Own only compliance-wide defaults and the root Axis Compliance Management
  contract; domain state remains with the domain capability.
- Publish client navigation from backend configuration. Axis must not invent
  routes, permissions, lifecycle actions, or feature readiness.
- Keep configuration layered and customer-overridable. Never store provider
  credentials, tenant policy, or legal-hold state in Axis.
- Mask sensitive values and deny raw evidence or provider-secret presentation
  by default.
- A new compliance capability contributes children under
  `compliance-management`; it must not publish a second compliance root.
