# Sustainable Growth Rate Calculator

An original annual ROE × retention approximation with three modes: ratios, annual accounting inputs, and required retention for a selected target. The accounting mode uses positive annual income and positive beginning/ending book equity; their simple two-point average is explicit. Dividend payout must be 0–100% of matching positive income. Nonpositive ROE, losses, nonpositive/crossing equity, excess dividends and targets requiring retention above 100% stop with explanatory errors.

The interpretation assumes stable operating and capital-policy conditions, no new equity issuance, and proportional borrowing can preserve leverage. It is not a no-external-financing internal-growth calculation, sales forecast, exact equity/funding roll-forward or automatic DDM/DCF growth assumption. No live company data is fetched.

Inputs/defaults and boundaries are defined in src/lib/calculators/sustainable-growth-rate.ts. The frozen independent examples are in evidence/sgr-reference-inputs-20261118.json. Recompute expectations with python scripts/check-sgr-reference.py. See sgr-internal-links-20261118.md for test, browser and internal-link evidence.
