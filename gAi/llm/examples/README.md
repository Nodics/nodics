# gAi Composition Example

A server that needs AI activates the group and required modules explicitly:

```js
activeModules: {
    groups: ['gAi'],
    modules: ['aiAssistant', 'aiKnowledge', 'aiProviders', 'openAiProvider']
}
```

The future `openAiProvider` module registers itself with `aiProviders`; callers
still use only their configured usage profiles.
