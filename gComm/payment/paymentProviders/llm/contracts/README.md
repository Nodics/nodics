# Payment Provider Contracts

Every payment provider adapter must expose:

- `providerCode`
- `providerFamily`
- `operations`
- `authorize(request)`
- `capture(request)`
- `void(request)`
- `refund(request)`
- `reconcile(request)`

All operations return normalized safe payment evidence. They must not return
raw PSP payloads, raw card data, or credentials.
