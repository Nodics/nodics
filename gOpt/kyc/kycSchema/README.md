# kycSchema Module

`kycSchema` owns KYC schema and data-contract definitions. It is the source-of-truth module for KYC entities and metadata consumed by `kycCore` and `kycApi`.

Use this module for KYC schema changes and generated artifact inputs. Runtime behavior belongs in `kycCore`, and API handling belongs in `kycApi`.

Generated KYC artifacts must be regenerated from schema definitions and must preserve privacy, validation, access control, and tenant boundaries.
