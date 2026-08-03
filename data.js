/* All series are real, sourced values. See the Sources section in index.html. */

/* BLS CPI annual averages via BLS Public Data API, indexed 1998 = 100.
   Major appliances: CUUR0000SS30021. Repair of household items: CUUR0000SEHP04.
   Annual averages are unavailable for 2011, 2021, 2022 (gaps in the published series). */
const CPI_APPLIANCES = [[1998,100.0],[1999,98.2],[2000,99.5],[2001,99.2],[2002,98.4],[2003,98.5],[2004,95.6],[2005,98.3],[2006,99.5],[2007,103.0],[2008,104.3],[2009,103.2],[2010,98.0],[2012,104.5],[2013,101.2],[2014,93.8],[2015,88.7],[2016,82.9],[2017,79.8],[2018,85.2],[2019,83.6],[2020,85.5],[2023,98.9]];
const CPI_REPAIR = [[1998,100.0],[1999,105.3],[2000,109.6],[2001,117.3],[2002,122.9],[2003,128.7],[2004,136.9],[2005,144.8],[2006,152.0],[2007,158.3],[2008,167.0],[2009,172.9],[2010,178.5],[2012,195.2],[2013,203.0],[2014,208.6],[2015,216.2],[2016,222.3],[2017,235.1],[2018,249.2],[2019,264.0],[2020,265.2],[2023,346.4]];

/* Average age of U.S. light vehicles, years.
   DOT/BTS National Transportation Statistics Table 1-26; 2022 onward per S&P Global Mobility. */
const VEHICLE_AGE = [[2002,9.6],[2010,10.8],[2013,11.4],[2016,11.6],[2019,11.8],[2022,12.2],[2023,12.5],[2024,12.6],[2025,12.8]];

/* Share of Americans living under an enforceable right-to-repair law. PIRG calculations.
   Drives the 100-household population stage. */
const R2R_STAGE = [
  { key: "none", pct: 0,     headline: "2022",
    note: "No state right-to-repair law in force anywhere in the United States." },
  { key: "five", pct: 20,    headline: "After the first five state laws",
    note: "New York, California, Minnesota, Oregon, Colorado. “One in five” Americans, per PIRG." },
  { key: "now",  pct: 25.75, headline: "January 1, 2026",
    note: "Six new laws took effect on that date. PIRG calculation." },
  { key: "fall", pct: 35,    headline: "Fall 2026, projected",
    note: "Connecticut in force July 2026; Texas follows in September." }
];

/* EU Ecodesign for Sustainable Products Regulation — first working plan, adopted April 2025. */
const ESPR_TIMELINE = [
  { year: "2024", label: "ESPR enters into force", detail: "Regulation (EU) 2024/1781, in force 18 July 2024." },
  { year: "2026", label: "First product groups", detail: "Iron and steel: emissions, energy efficiency, resilience." },
  { year: "2027", label: "Repairability rules for electronics", detail: "Aluminium, textiles and tyres also enter scope, with measures on longer product lifespans." },
  { year: "2029", label: "Electronics: durability, recycled content", detail: "Furniture entered scope in 2028; mattresses and electronics face durability, recyclability and recycled-content rules." },
  { year: "2030", label: "Near-universal lifecycle data", detail: "Almost all product categories require full lifecycle environmental data via the Digital Product Passport." }
];

/* STILE assessment, August 2026. Hines & McBride.
   Scale 1-3, expressed on the Three Horizons: 1 = prevailing system, 3 = emergent only. */
const STILE = [
  { key: "S", name: "Social acceptance", score: 2.0,
    rationale: "Holding periods are lengthening in both consumer categories that are tracked: U.S. light vehicles at a record 12.8-year average age, and 42% of U.S. iPhone buyers retiring a device held three or more years, up from 24% five years earlier. No equivalent series exists for appliances. Survey answers on paying more for sustainable products run from 59% (Eurobarometer) down to 17% for a green premium (BCG) — both stated intent, and a spread that wide settles nothing.",
    watch: "A published U.S. appliance holding-period or installed-base age series. That would move this element more than any further survey." },
  { key: "T", name: "Technological capability", score: 1.5,
    rationale: "Modular, repairable architectures ship today: Framework's swappable mainboards, Prusa's self-assembled and upgradeable printers, Groupe SEB's fifteen-year parts commitment, Speed Queen's twenty-five-year test standard. The engineering has been done by other manufacturers, at smaller volumes.",
    watch: "A mass-volume manufacturer shipping a serviceable modular platform. That moves this element to 1." },
  { key: "I", name: "Infrastructure", score: 2.5,
    rationale: "U.S. appliance repair is a $7.0B industry spread across roughly 37,800 businesses with no firm above 5% share (IBISWorld, commercial source). A sector that fragmented offers no national parts-and-service backbone for a manufacturer to plug into. This is the binding constraint on the shift.",
    watch: "Technician headcount, parts-distribution consolidation, and whether any OEM builds or acquires a national service network." },
  { key: "L", name: "Legal clearance", score: 1.5,
    rationale: "Eight states have repair statutes in force and Texas follows in September; coverage reaches roughly 35% of Americans by fall 2026. EU repair obligations applied from July 2026, and ESPR ecodesign rules phase in through 2030. France mandates a durability score at the point of sale. The FTC order against Deere sets an enforcement precedent, though it is proposed rather than final, and several state laws — Oregon's among them — carry no penalties until 2027.",
    watch: "The 2027 Copyright Office triennial, whether the Deere order is finalized, and each ESPR category date as it lands." },
  { key: "E", name: "Entrepreneurial zeal", score: 2.5,
    rationale: "The champions are niche: Speed Queen, Miele, Framework, Prusa, Bundles. No mass-market U.S. manufacturer has claimed the position, and AHAM, the appliance trade association, has opposed repair legislation. The vacancy is the opportunity.",
    watch: "A durability or repairability claim in mass-market appliance advertising, or a change in the trade association's position." }
];

/* Three Horizons vocabulary, replacing in place / in progress / absent. */
const HORIZONS = [
  { n: 1, name: "Prevailing", gloss: "part of the current system" },
  { n: 2, name: "In transition", gloss: "contested; moving, not settled" },
  { n: 3, name: "Emergent only", gloss: "exists in the future state, not this one" }
];
function horizonFor(score) { return score < 1.75 ? 1 : score < 2.25 ? 2 : 3; }

/* Population stage: 100 U.S. households. */
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
