# Store and Storefront Integration

Store owns Store identity, lifecycle, and Store-to-Warehouse assignments. It exposes a bounded service-token reference API so Pricing, Storefront, and other modules can validate active Stores without copying them.

Storefront owns hostname, CMS Site, and Store composition. CMS owns Sites and content catalogs. This replaces the earlier Store-owned Site-binding path, which was removed to prevent duplicate authority.

For setup examples, human and service authentication, exact-host rules, operations, troubleshooting, and verification, read [Storefront Foundation](../../../gExp/storefront/docs/storefront-foundation.md) and [How To Model Stores And Website Experiences](../../../gDocs/commerce/how-to-model-stores-and-websites.md).
