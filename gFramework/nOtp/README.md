# nOtp

`nOtp` owns one-time-password capability support. It provides OTP schemas, facade/controller routes, generation and validation services, handlers, and pipeline hooks.

Use this module for OTP lifecycle behavior that belongs to the framework capability. Delivery channels, customer-specific challenge flows, and policy tuning should be contributed through project modules and layered configuration.

OTP changes must preserve validation, expiry, tenant isolation, diagnostics, and access control. Avoid embedding one customer's verification workflow into the framework default.
