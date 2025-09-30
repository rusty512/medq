# RAMQ Specialist Billing (XML Logic + Engine)

## Objective

Provide a deterministic, RAMQ-compliant specialist billing backend driven by official “aide à la saisie” XML files. Developers should be able to: review the data, understand the engine, run validations/calculations, and trace how results were produced.

## What lives here

```
backend/ramq-xml-logic/2025-06-13T12-04-06/
├── xml/                                    # Official RAMQ XML inputs
│   ├── codeFacturation_Specialiste_*.xml   # Billing codes
│   ├── elementContexte_Specialiste_*.xml   # Context rules
│   ├── messageExplicatif_Specialiste_*.xml # Error messages
│   ├── infoEtablissement_*.xml            # Establishments
│   ├── codeLocalite_*.xml                 # Locality codes
│   └── secteurActivite_Specialiste_*.xml  # Activity sectors
├── parsed/
│   ├── specialist/
│   │   ├── billing-codes.json             # 7,352 codes (w/ specialties)
│   │   ├── context-rules.json             # Rules mapped by code
│   │   ├── error-messages.json            # Explanatory messages
│   │   ├── establishments.json            # 5,379 establishments
│   │   ├── locations.json                 # 1,248 localities
│   │   └── activity-sectors.json          # 19 sectors
│   └── crosswalk/codes-map.json           # Code → amount mappings (seeded)
└── README.md                              # You are here
```

Engine and API code using these datasets:

```
backend/services/
├── specialistBillingEngine.js          # Core engine (validation+calc)
├── simpleValidationService.js          # Structural validation
└── specialistXmlParserService.js       # XML → JSON parsing pipeline

backend/routes/
└── specialist.js                       # REST API for validation/calc
```

## How it works (end-to-end)

1) Data ingestion (one-time or when XMLs change)
- `specialistXmlParserService.js` parses the XML files in `xml/` and writes normalized JSON into `parsed/specialist/` and `parsed/crosswalk/`.

2) Engine initialization
- `SpecialistBillingEngine.initialize()` loads the JSON datasets, builds an index of context rules by code, and prepares validation helpers.

3) Validation & calculation
- `getCodesForSpecialist(specialty, establishment, context)` filters codes by specialty and basic context (age, time, establishment existence).
- `validateBilling({ codes, specialty, establishment, context })` runs structural checks and enforces simple required/forbidden combinations derived from rule texts.
- `calculateBilling({ codes, specialty, establishment, context, supplements })` computes:
  - Base amounts from `parsed/crosswalk/codes-map.json` (fallback 0 if unmapped)
  - Supplements/majorations: age, time, guard duty, regional/remote (rule‑triggered)
  - Returns a breakdown with `baseCodes`, `supplements`, `majorations`, `total`.

4) API exposure
- `POST /api/specialist/validate` → returns validation details
- `POST /api/specialist/calculate` → returns calculation breakdown plus sample rule texts per code for UI traceability

## Developer guide

Review the data
- Start with `parsed/specialist/billing-codes.json` for code coverage.
- Inspect `parsed/specialist/context-rules.json` for the textual rule constraints used by the engine.
- Check `parsed/crosswalk/codes-map.json` for amounts applied during calculation.

Review the code
- Engine: `backend/services/specialistBillingEngine.js`
  - Key methods: `initialize`, `getCodesForSpecialist`, `validateBilling`, `calculateBilling`
  - Helpers: `deriveAgeConstraintsFromRules`, `deriveTimeConstraintsFromRules`, `deriveRegionalConstraintsFromRules`, `deriveCombinationConstraintsFromRules`
- API: `backend/routes/specialist.js` (`/status`, `/codes`, `/validate`, `/calculate`)
- Parser: `backend/services/specialistXmlParserService.js`

Run quick tests
```bash
cd backend
npm run test-billing
```
Expected highlights
- Pediatric supplement raises total above base.
- Remote majoration raises total when remote context applies.

## Notes on scope and rates

- Amounts come from `parsed/crosswalk/codes-map.json` (seeded). Extend this mapping for broader coverage.
- Supplements/majorations use a centralized `rateConfig` in the engine. Replace placeholder rates with official values as you enrich the crosswalk and rules mapping.

## Objectives recap

- Deterministic specialist billing using RAMQ data
- Real-time validation to prevent invalid combinations
- Transparent breakdown for UI (what was applied and why)
- Clear code/data locations for developer review

## Updating data

1) Replace XMLs under `xml/` with new versions
2) Re-run the parser (invoke the service or integrate a script) to regenerate JSONs
3) Update `codes-map.json` with additional amounts as needed

## Support & next steps

- Expand `codes-map.json` coverage with official tariffs
- Add finer-grained parsing of context rules to capture more constraints precisely
- Integrate direct RFP submissions (NMA5) and TIP‑I lot flows in the API layer when ready
