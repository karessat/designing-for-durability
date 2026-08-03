# Designing for Durability

A scrollytelling foresight briefing on the changing economics of the U.S. home appliance industry, prepared as a case study exercise for the Dig Insights Future Strategy & Innovation team.

**Live:** https://karessat.github.io/designing-for-durability/

## Structure

Follows the case study brief: shift → drivers → signals → application → maturity.

1. **The shift** — the proposition, stated first
2. **Why it didn't happen before** — BLS CPI, 1998–2023: appliance prices flat while repair costs tripled, which made designing for replacement correct. Then the first crack: vehicle holding periods rising anyway
3. **Five drivers** — software-defined products, right to repair, circular design and sustainability law, tariffs and geopolitical instability, relational retail and trust. Mapped to PESTLE
4. **Six signals** — three strong (right-to-repair coverage 0 → 35%, the FTC/Deere consent order, EU ecodesign law and the DMCA commercial-equipment exemption), three weak (Framework and Prusa, Apple Self Service Repair, the Repair Café movement). Each weak signal states why it is weak
5. **Four provocations** — applied to Whirlpool, with the evidence gaps named rather than papered over
6. **STILE** — scored on the Three Horizons, with per-element watch indicators and a six-month rescoring cadence
7. **Method & sources** — 23 citations, source-quality grading, data tables

## Data

All series are real and cited. CPI retrieved from the BLS Public Data API (CUUR0000SS30021, CUUR0000SEHP04), indexed 1998 = 100. Vehicle age from DOT/BTS Table 1-26 and S&P Global Mobility. Right-to-repair coverage from PIRG. ESPR timeline from Regulation (EU) 2024/1781 and its 2025–2030 working plan. Full source list and caveats in the Sources section of the page.

Commercially interested sources are labeled at the point of use. Survey figures are marked as stated intent rather than observed behavior.

## Build

No build step, no dependencies. Static HTML/CSS/JS. Serve the directory and open `index.html`.

Deep links: append `#s=<step-id>` to jump to a scrollytelling step, plus `&instant` to disable animation.

Format after pudding.cool. Illustrations: woodcut-style appliance set, tinted programmatically into per-state variants.
