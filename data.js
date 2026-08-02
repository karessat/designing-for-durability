/* All series are real, sourced values. See Sources section in index.html. */

/* BLS CPI annual averages via BLS Public Data API, indexed 1998 = 100.
   Major appliances: CUUR0000SS30021. Repair of household items: CUUR0000SEHP04.
   Annual averages are unavailable for 2011, 2021, 2022 (gaps in the published series). */
const CPI_APPLIANCES = [[1998,100.0],[1999,98.2],[2000,99.5],[2001,99.2],[2002,98.4],[2003,98.5],[2004,95.6],[2005,98.3],[2006,99.5],[2007,103.0],[2008,104.3],[2009,103.2],[2010,98.0],[2012,104.5],[2013,101.2],[2014,93.8],[2015,88.7],[2016,82.9],[2017,79.8],[2018,85.2],[2019,83.6],[2020,85.5],[2023,98.9]];
const CPI_REPAIR = [[1998,100.0],[1999,105.3],[2000,109.6],[2001,117.3],[2002,122.9],[2003,128.7],[2004,136.9],[2005,144.8],[2006,152.0],[2007,158.3],[2008,167.0],[2009,172.9],[2010,178.5],[2012,195.2],[2013,203.0],[2014,208.6],[2015,216.2],[2016,222.3],[2017,235.1],[2018,249.2],[2019,264.0],[2020,265.2],[2023,346.4]];

/* Average age of U.S. light vehicles, years.
   DOT/BTS National Transportation Statistics Table 1-26; 2022+ per S&P Global Mobility. */
const VEHICLE_AGE = [[2002,9.6],[2010,10.8],[2013,11.4],[2016,11.6],[2019,11.8],[2022,12.2],[2023,12.5],[2024,12.6],[2025,12.8]];

/* Share of Americans living under an enforceable right-to-repair law. PIRG calculations. */
const R2R_COVERAGE = [
  { label: "2022", value: 0, note: "No state law yet in force. The first, New York's, took effect in December 2023." },
  { label: "First five state laws in force", value: 20, note: "New York, California, Minnesota, Oregon, Colorado. “One in five” per PIRG." },
  { label: "January 1, 2026", value: 25.75, note: "Six new laws took effect on this date. PIRG calculation." },
  { label: "Fall 2026", value: 35, note: "Projected: Connecticut in force July 2026, Texas September 2026.", projected: true }
];

/* STILE assessment, August 2026. Scale: 1 = condition in place, 3 = condition absent (Hines & McBride). */
const STILE = [
  { key: "S", name: "Social acceptance", score: 2.0,
    rationale: "Holding behavior has shifted in the categories that are tracked: vehicles at a record 12.8-year average age, 42% of U.S. iPhone buyers retiring devices held three or more years. No equivalent series exists for appliances. Survey answers on paying more for sustainable products range from 59% (Eurobarometer) down to 17% for a green premium (BCG) — both stated intent, and the spread is wide enough that neither settles the question." },
  { key: "T", name: "Technological capability", score: 1.5,
    rationale: "Modular, repairable architectures ship today: Framework's swappable mainboards, Prusa's self-assembled and upgradeable printers, SEB's 15-year parts commitment, Speed Queen's 25-year test standard. The engineering problems are ones that other manufacturers have already solved, at smaller volumes." },
  { key: "I", name: "Infrastructure", score: 2.5,
    rationale: "U.S. appliance repair is a $7.0B industry spread across roughly 37,800 businesses with no firm above 5% share (IBISWorld, commercial source). A sector that size and that fragmented has no national parts-and-service backbone for a manufacturer to plug into. This is the binding constraint on the shift." },
  { key: "L", name: "Legal clearance", score: 1.5,
    rationale: "Eight states have repair statutes in force and Texas follows in September; coverage reaches roughly 35% of Americans in fall 2026. EU repair obligations applied from July 2026. France mandates a durability score at the point of sale for two categories. The FTC consent order against Deere sets an enforcement precedent, though it is proposed rather than final, and several state laws — Oregon's among them — carry no penalties until 2027." },
  { key: "E", name: "Entrepreneurial zeal", score: 2.5,
    rationale: "Champions are niche: Speed Queen, Miele, Framework, Prusa, Bundles. No mass-market U.S. manufacturer has claimed the position, and AHAM, the appliance trade association, has opposed repair legislation. The vacancy is the opportunity." }
];

/* Population stage: shares from UBA / Öko-Institut (2016), German household data.
   55.6% of replacements faulty (2012/13); about one third still functioning; 8.3% replaced
   within five years due to a defect (up from 3.5% in 2004). Those two categories leave ~11%
   unaccounted for in the source; those units are shown untinted and labeled as such.
   Population is illustrative — the shares are real, the individual units are not. */
const POP = { total: 100, faulty: 56, working: 33, earlyFail: 8 };

const POP_TYPES = [
  ["washer","washing machine",8],["dryer","clothes dryer",7],["fridge","refrigerator",9],
  ["fridge2","refrigerator",5],["range","range",7],["range2","range",4],
  ["oven","wall oven",5],["microwave","microwave oven",6],["toaster","toaster",4],
  ["kettle","electric kettle",4],["mixer","stand mixer",4],["processor","food processor",3],
  ["blender","blender",3],["coffee","coffee maker",5],["vacuum","vacuum cleaner",5],
  ["robovac","robot vacuum",3],["fan","fan",4],["heater","space heater",4],
  ["ac","air conditioner",4],["iron","iron",3],["purifier","air purifier",3],
  ["slowcooker","slow cooker",3],["ricecooker","rice cooker",3],["hairdryer","hair dryer",4]
];
