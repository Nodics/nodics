# Payment Provider Core LLM Context

Use this context when extending shared provider adapter contracts or execution
governance.

- Keep payment transaction lifecycle in Payment Core.
- Keep provider-specific protocol behavior in individual provider modules.
- Keep provider credentials and raw payloads out of schema/config/test evidence.
- Prefer configuration and service overrides over framework edits.
