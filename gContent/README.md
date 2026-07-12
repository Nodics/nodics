# gContent

`gContent` is the content-capability group that composes the `cms` and `wcms`
modules. It contributes shared configuration but leaves schemas, services,
routers, data, and tests to its child modules.

## Dependencies

- `cms`
- `wcms`

## Customization

Projects should override content behavior in later-index modules through schemas,
services, routers, pipelines, data, and configuration rather than changing this
group module.
