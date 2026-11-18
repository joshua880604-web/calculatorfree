# COBRA Cost Calculator — original model

Ordinary federal COBRA premium-only worksheet with a 0–2% administrative charge and constant entered monthly subsidy. Matching coverage tier, no eligibility or duration determination, medical spending, state continuation or disability-extension premium model.

Modes, defaults, units and input limits are defined in src/lib/calculators/cobra-cost.ts. Values are USD. Numeric fields reject missing/nonfinite inputs. Currency is rounded for presentation; the model retains precision internally. All public examples restore every field through the existing versioned fragment format.

COBRA: reconstruct the full monthly plan premium from employee and employer shares, or enter the full premium directly. Add a selected 0–2% administrative charge and subtract one constant monthly subsidy. Multiply by 1–36 user-selected planning months without implying eligible duration. Reject subsidy above the modeled premium and prior employee payment above the same-tier full premium. Excludes disability-extension pricing, state continuation and medical expenses.

Official concept source: https://www.cms.gov/cciio/programs-and-initiatives/other-insurance-protections/cobra_fact_sheet. Checked 2026-11-18. Original calculations are verified with python scripts/check-cash-cobra-reference.py and tests/cash-cobra.test.ts. See cash-cobra-20261118.md for browser, visual and static-link verification. Exact source interface comparison is not applicable.
