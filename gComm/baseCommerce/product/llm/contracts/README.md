# Product AI Contracts

- [Product capability contract](product-capability-contract.md): identity, authority,
  lifecycle, security, and customization rules.

Release-readiness evidence is maintained in
canonical documentation `capability.commerce.technical-reference`; do not create a parallel validation
framework in this directory.

## Product Media Assignment Contract

Product owns media assignment meaning, not binary storage. A Product media
record must use `productMediaCode` as the Product-owned identity and exactly
one of `mediaCode` or `mediaSetCode` as the `nMedia` reference.

Use `mediaCode` for one concrete media item. Use `mediaSetCode` when the
business asset has several files or variants such as original, thumbnail,
mobile, desktop, large, and zoom.

Product owns item identity, role, position, locale, alt text, Catalog scope,
lifecycle, publication inclusion, and search projection fields. `nMedia` owns
storage provider, storage key, generated URL, MIME policy, checksum, upload
limits, lifecycle of the file itself, and provider-specific behavior.

Do not add provider URLs, local filesystem paths, cloud bucket keys, signed URL
logic, image transformation, upload validation, or media-delivery fallback to
Product. Validate `mediaCode` and `mediaSetCode` through the implemented
`nMedia` reference lookup contract, and resolve delivery descriptors only
through an explicit nMedia-owned delivery contract.
