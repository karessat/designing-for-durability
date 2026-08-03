/* All series are real, sourced values. See the Sources section in index.html. */

/* ---- BLS, via the Public Data API, retrieved August 2026 ----
   Major appliances CPI: CUUR0000SS30021.  Household repair CPI: CUUR0000SEHP04.
   All-items CPI: CUUR0000SA0.  Household appliance PPI: WPU1241.
   "Real" = the price index divided by all-items CPI, so inflation is taken out.
   Everything is set to 100 in 1998 so the lines start together.
   The 2026 point is June 2026. Gaps are years BLS did not publish an annual average. */

const REAL_APPLIANCES = [[1998,100.0],[1999,96.1],[2000,94.2],[2001,91.3],[2002,89.2],[2003,87.2],[2004,82.5],[2005,82.1],[2006,80.4],[2007,81.0],[2008,79.0],[2009,78.4],[2010,73.2],[2011,69.8],[2012,74.2],[2013,70.8],[2014,64.6],[2015,61.0],[2016,56.3],[2017,53.1],[2018,55.3],[2019,53.3],[2020,53.8],[2021,61.3],[2022,59.2],[2023,52.9],[2024,48.6],[2025,48.9],[2026,49.2]];
const REAL_REPAIR = [[1998,100.0],[1999,103.0],[2000,103.8],[2001,108.0],[2002,111.3],[2003,114.0],[2004,118.2],[2005,120.8],[2006,122.9],[2007,124.5],[2008,126.4],[2009,131.4],[2010,133.4],[2012,138.6],[2013,142.0],[2014,143.7],[2015,148.7],[2016,151.0],[2017,156.3],[2018,161.7],[2019,168.3],[2020,167.0],[2023,185.3]];
