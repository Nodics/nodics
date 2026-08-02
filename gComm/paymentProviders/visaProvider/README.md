# Visa Provider

`visaProvider` contributes a mocked Visa-style network/product adapter to the
Payment provider boundary. Visa integrations are product-specific, so this
module intentionally stays conservative: it proves the adapter contract and
safe evidence shape without pretending that every Visa API is a normal merchant
payment service provider.
