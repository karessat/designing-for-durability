/* All series are real, sourced values. See the Sources section in index.html. */

/* ---- BLS, via the Public Data API, retrieved August 2026 ----
   Major appliances CPI: CUUR0000SS30021.  Household repair CPI: CUUR0000SEHP04.
   All-items CPI: CUUR0000SA0.  Household appliance PPI: WPU1241.
   "Real" = the price index divided by all-items CPI, so inflation is taken out.
   Everything is set to 100 in 1998 so the lines start together.
   The 2026 point is June 2026. Gaps are years BLS did not publish an annual average. */

const REAL_APPLIANCES = [[1998,100.0],[1999,96.1],[2000,94.2],[2001,91.3],[2002,89.2],[2003,87.2],[2004,82.5],[2005,82.1],[2006,80.4],[2007,81.0],[2008,79.0],[2009,78.4],[2010,73.2],[2011,69.8],[2012,74.2],[2013,70.8],[2014,64.6],[2015,61.0],[2016,56.3],[2017,53.1],[2018,55.3],[2019,53.3],[2020,53.8],[2021,61.3],[2022,59.2],[2023,52.9],[2024,48.6],[2025,48.9],[2026,49.2]];
const REAL_REPAIR = [[1998,100.0],[1999,103.0],[2000,103.8],[2001,108.0],[2002,111.3],[2003,114.0],[2004,118.2],[2005,120.8],[2006,122.9],[2007,124.5],[2008,126.4],[2009,131.4],[2010,133.4],[2012,138.6],[2013,142.0],[2014,143.7],[2015,148.7],[2016,151.0],[2017,156.3],[2018,161.7],[2019,168.3],[2020,167.0],[2023,185.3]];

/* Percent change since 1998 — NOT price levels. A raw material and a finished
   machine cannot be compared on price, only on how much each has moved.
   Steel: BLS iron and steel PPI (WPU101). Appliances: BLS major appliances CPI. */
const STEEL_PCT = [[1998,0.0],[1999,-6.9],[2000,-4.8],[2001,-10.4],[2002,-6.9],[2003,-0.8],[2004,32.6],[2005,39.7],[2006,52.2],[2007,64.2],[2008,101.1],[2009,50.2],[2010,82.4],[2011,106.7],[2012,96.5],[2013,84.8],[2014,89.5],[2015,59.7],[2016,52.7],[2017,73.1],[2018,94.1],[2019,81.4],[2020,70.0],[2021,191.2],[2022,210.6],[2023,171.9],[2024,152.4],[2025,156.7],[2026,199.1]];
const APPL_PCT  = [[1998,0.0],[1999,-1.8],[2000,-0.5],[2001,-0.8],[2002,-1.6],[2003,-1.5],[2004,-4.4],[2005,-1.7],[2006,-0.5],[2007,3.0],[2008,4.3],[2009,3.2],[2010,-2.0],[2011,-3.7],[2012,4.5],[2013,1.2],[2014,-6.2],[2015,-11.3],[2016,-17.1],[2017,-20.2],[2018,-14.8],[2019,-16.4],[2020,-14.5],[2021,2.0],[2022,6.2],[2023,-1.1],[2024,-6.5],[2025,-3.4],[2026,0.8]];

/* Average age of U.S. light vehicles, years. DOT/BTS Table 1-26; S&P Global Mobility from 2022. */
const VEHICLE_AGE = [[2002,9.6],[2010,10.8],[2013,11.4],[2016,11.6],[2019,11.8],[2022,12.2],[2023,12.5],[2024,12.6],[2025,12.8]];

/* Share of Americans living under a state right-to-repair law. PIRG. Drives the household grid. */
const R2R_STAGE = [
  { key:"none", pct:0,     headline:"2022",
    note:"No state had a right-to-repair law in force." },
  { key:"five", pct:20,    headline:"After the first five states",
    note:"New York, California, Minnesota, Oregon, Colorado. One American in five." },
  { key:"now",  pct:25.75, headline:"1 January 2026",
    note:"Six more laws started that day." },
  { key:"fall", pct:35,    headline:"Autumn 2026",
    note:"Connecticut started in July. Texas starts in September." }
];

/* EU Ecodesign for Sustainable Products Regulation. First working plan, adopted April 2025. */
const ESPR_TIMELINE = [
  { year:"2024", label:"The law starts", detail:"Regulation (EU) 2024/1781 comes into force on 18 July." },
  { year:"2026", label:"First products named", detail:"Iron and steel go first." },
  { year:"2027", label:"Electronics must be repairable", detail:"Aluminium, textiles and tyres join, with rules on making things last longer." },
  { year:"2029", label:"Electronics must last", detail:"Durability, recyclability and recycled-content rules. Furniture joined in 2028." },
  { year:"2030", label:"Nearly everything", detail:"Almost every product needs a Digital Product Passport showing what is inside it." }
];

/* STILE, August 2026. Hines & McBride. Scored 1-3 and read on the Three Horizons. */
const STILE = [
  { key:"S", name:"Do people want it?", short:"Social acceptance", score:1.5,
    rationale:"They are already behaving that way. In McKinsey's survey of more than 9,000 appliance buyers, the share who wait ten years or more before replacing rose from 35% to 39% in a single year, and buyers now rank durability, efficiency and price above smart features. Cars say the same thing: the average American car is 12.8 years old, a record for the eighth year running. What is still missing is proof that people will pay extra up front — survey answers on that range from 59% to 17%, which is too wide to trust.",
    watch:"A U.S. figure for how long people keep appliances, published regularly. And any brand that charges more for a durable machine and reports what happened to sales." },
  { key:"T", name:"Can it be built?", short:"Technological capability", score:1.5,
    rationale:"Yes, and it already is. Framework sells laptops whose main board you can swap. Prusa sells printers you build yourself and upgrade later. Groupe SEB keeps parts for fifteen years. Speed Queen tests washers to twenty-five years of use. Nobody has to invent anything.",
    watch:"A big manufacturer shipping a modular machine at a normal price. That would move this to 1." },
  { key:"I", name:"Is there a system to support it?", short:"Infrastructure", score:2.5,
    rationale:"No. Fixing appliances in the U.S. is a $7.0B business split among roughly 37,800 firms, none holding more than 5% of it. There is no national repair network a manufacturer can plug into, and no way to get an old machine back from a customer. This is the thing that is actually missing.",
    watch:"Anyone building or buying a national repair and parts network. Also whether delivery crews start bringing old machines back instead of scrapping them." },
  { key:"L", name:"Is it allowed and encouraged?", short:"Legal clearance", score:1.5,
    rationale:"Yes, and increasingly required. Eight states have repair laws in force, Texas makes nine in September, and that covers about 35% of Americans. Europe has set dates through 2030 for products to be durable and repairable. France prints a durability score next to the price. The FTC has taken a manufacturer to court over locking up repair tools and won terms.",
    watch:"Whether the Deere order is made final, the 2027 Copyright Office review, and each new EU date as it lands." },
  { key:"E", name:"Is anyone actually doing it?", short:"Entrepreneurial zeal", score:2.5,
    rationale:"Barely. The companies doing it are small or expensive: Speed Queen, Miele, Framework, Prusa, Bundles. No big American appliance brand has claimed durability as its position, and the industry's own trade group has argued against repair laws. That is why the space is still empty.",
    watch:"Any mass-market brand advertising on durability or repairability. Or the trade group changing its mind." }
];

const HORIZONS = [
  { n:1, name:"Already here", gloss:"this is normal today" },
  { n:2, name:"On its way",   gloss:"moving, not settled" },
  { n:3, name:"Not yet",      gloss:"still missing" }
];
function horizonFor(score){ return score < 1.75 ? 1 : score < 2.25 ? 2 : 3; }

/* 100 U.S. households for the right-to-repair grid. */
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
