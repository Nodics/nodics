This is a sample readme file for your cache module

Authentication refresh sessions use the layered cache `consume` contract for
atomic read-and-delete semantics. Cache engine modules must implement this
operation atomically and fail closed when the backend cannot guarantee
single-use consumption.
