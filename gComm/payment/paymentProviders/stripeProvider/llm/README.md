# Stripe Provider LLM Guide

Use this module only for Stripe protocol translation. Selection, transaction
state, retry, refund, and reconciliation authority stays in `gComm/payment`.
The default adapter is a mocked public-contract adapter and must not perform
live network calls.
