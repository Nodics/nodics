# nMedia AI Guidance

AI tools working on media must preserve a single authority path:

```text
Caller module or frontend
  -> nMedia media/folder/media-set/reference contract
  -> nMedia provider registry
  -> active storage provider implementation
```

Never create a parallel upload, media table, storage path resolver, CDN URL builder, or import-file staging rule in a caller module.

Read `llm/contracts/README.md` before changing source.
