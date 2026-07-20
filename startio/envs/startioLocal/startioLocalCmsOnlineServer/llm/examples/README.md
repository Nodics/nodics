# Online CMS customization example

A later deployment server may replace ports, database coordinates, storage
provider, or target-local services. It must keep `runtimeRole: 'ONLINE'`, keep
`publishEnabled: false`, and retain explicit non-versioned CMS schema overrides.
