# AI Provider Configuration Example

```js
module.exports = {
    aiProviders: {
        enabled: true,
        profiles: {
            assistantGeneration: {
                capability: 'GENERATION',
                provider: 'openAi',
                model: 'environment-approved-model',
                fallbackProviders: []
            }
        },
        providers: {
            openAi: {
                enabled: true,
                adapterService: 'OpenAiProviderAdapterService',
                secretReference: 'vault://environment/ai/openai'
            }
        },
        tokenOptimization: {
            profiles: {
                assistantGeneration: {
                    maximumInputTokens: 24000,
                    maximumOutputTokens: 4000,
                    minimumReservedOutputTokens: 1000,
                    maximumEstimatedCost: '0.25000000',
                    currencyCode: 'USD'
                }
            }
        },
        pricing: {
            models: {
                'openAi:environment-approved-model': {
                    revision: 'reviewed-rate-2026-01',
                    currencyCode: 'USD',
                    inputPerMillion: '0.00000000',
                    outputPerMillion: '0.00000000',
                    cachedInputPerMillion: '0.00000000'
                }
            }
        },
        ledger: {
            reservationTtlSeconds: 300,
            uncertainRetentionSeconds: 86400,
            expiryBatchSize: 100,
            maximumCompareAndSwapAttempts: 5,
            repair: {
                deterministicRepairApprovalMode: 'MANUAL',
                scheduleWindowMinutes: 15
            },
            budget: {
                period: 'MONTH',
                scopeDimensions: [
                    'tenantCode', 'enterpriseCode', 'applicationCode',
                    'principalCode', 'profileCode', 'providerCode', 'modelCode'
                ],
                defaultMaximumTokens: 1000000,
                defaultMaximumCost: '100.00000000',
                currencyCode: 'USD'
            }
        }
    }
};
```

This is a layered override fragment. Never store the credential value here.
Replace illustrative zero rates with reviewed provider pricing before enabling
the provider. Narrowing the scope dimensions can cause multiple principals or
applications to share one budget; treat that as a governed business decision.
