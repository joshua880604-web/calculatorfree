# Cash Advance Fee Calculator — original model

One USD credit-card cash advance with a single full repayment, selected daily simple or compounded interest, explicit day basis and fee treatment. No intervening payments, statement-cycle capitalization, purchase balances, issuer quote, statutory APR or merchant cash advance.

Modes, defaults, units and input limits are defined in src/lib/calculators/cash-advance-fee.ts. Values are USD. Numeric fields reject missing/nonfinite inputs. Currency is rounded for presentation; the model retains precision internally. All public examples restore every field through the existing versioned fragment format.

Cash: fee=max(amount × percentage, minimum)+ATM; a single full repayment, 360/365 day basis and simple/daily-compound alternatives. All entered fees either remain upfront or join the interest-bearing balance. The output cost is fees plus interest; principal plus cost is total cash needed. Zero-day annualization is undefined. No issuer agreement, no legal APR and no partial-payment schedule are inferred.

Official concept source: https://www.consumerfinance.gov/ask-cfpb/what-is-a-grace-period-for-a-credit-card-en-47/. Checked 2026-11-18. Original calculations are verified with python scripts/check-cash-cobra-reference.py and tests/cash-cobra.test.ts. See cash-cobra-20261118.md for browser, visual and static-link verification. Exact source interface comparison is not applicable.
