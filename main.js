/* Designing for Durability — scrollytelling engine. No dependencies. */
(function () {
"use strict";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- seeded RNG so the population is stable across loads ---------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260802);

/* ================= POPULATION: 100 U.S. HOUSEHOLDS ================= */
const popInner = document.getElementById("popInner");
const popTip = document.getElementById("popTip");
const popPct = document.getElementById("popPct");
const popLabel = document.getElementById("popLabel");
const popNote = document.getElementById("popNote");

const roster = [];
POP_TYPES.forEach(([icon, label, n]) => { for (let i = 0; i < n; i++) roster.push({ icon, label }); });
while (roster.length > 100) roster.splice(Math.floor(rand() * roster.length), 1);
for (let i = roster.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [roster[i], roster[j]] = [roster[j], roster[i]];
}
// coverageRank: the order in which households gain coverage. Fixed, so growth is additive.
roster.forEach((u, i) => { u.id = i; u.jx = rand() * 8 - 4; u.jy = rand() * 8 - 4; });
const coverageOrder = roster.map((_, i) => i);
for (let i = coverageOrder.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [coverageOrder[i], coverageOrder[j]] = [coverageOrder[j], coverageOrder[i]];
}
coverageOrder.forEach((id, rank) => { roster[id].rank = rank; });

// separate shuffle for on-screen placement, so covered units don't cluster
const gridOrder = roster.map((_, i) => i);
for (let i = gridOrder.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [gridOrder[i], gridOrder[j]] = [gridOrder[j], gridOrder[i]];
}

const units = roster.map((u) => {
  const el = document.createElement("div");
  el.className = "unit";
  el.style.backgroundImage = `url(assets/${u.icon}_d.png)`;
  el.setAttribute("role", "img");
  el.setAttribute("aria-label", u.label);
  el.dataset.id = u.id;
  popInner.appendChild(el);
  u.el = el;
  return u;
});

let currentPct = 0;
function showTip(u, x, y) {
  const covered = u.rank < currentPct;
  popTip.innerHTML =
    `<span class="t">HOUSEHOLD ${String(u.id + 1).padStart(3, "0")}</span><br>` +
    `owns a ${u.label}<br>` +
    (covered
      ? `<span style="color:var(--accent)">covered by a state right-to-repair law</span>`
      : `no right-to-repair law in this state`) +
    `<br><span style="opacity:.65">illustrative household · coverage share per PIRG</span>`;
  popTip.style.left = Math.min(x + 14, window.innerWidth - 250) + "px";
  popTip.style.top = Math.min(y + 14, window.innerHeight - 110) + "px";
  popTip.classList.add("on");
}
popInner.addEventListener("pointermove", (e) => {
  const t = e.target.closest(".unit");
  if (t) showTip(roster[+t.dataset.id], e.clientX, e.clientY);
  else popTip.classList.remove("on");
});
popInner.addEventListener("pointerleave", () => popTip.classList.remove("on"));
popInner.addEventListener("click", (e) => {
  const t = e.target.closest(".unit");
  if (t) showTip(roster[+t.dataset.id], e.clientX, e.clientY);
});

function layoutGrid() {
  const W = popInner.clientWidth, H = popInner.clientHeight;
  const cols = 10;
  const margin = Math.min(W, H) < 700 ? 34 : 80;
  const cw = (W - margin * 2) / cols, ch = (H - margin * 2 - 70) / 10;
  units.forEach((u) => {
    const pos = gridOrder.indexOf(u.id);
    u.gx = margin + (pos % cols) * cw + cw / 2 - 26 + u.jx;
    u.gy = margin + Math.floor(pos / cols) * ch + ch / 2 - 26 + u.jy;
  });
}

function popSet(stage) {
  layoutGrid();
  currentPct = stage.pct;
  units.forEach((u) => {
    u.el.style.transform = `translate(${u.gx}px, ${u.gy}px)`;
    const covered = u.rank < stage.pct;
    u.el.style.backgroundImage = `url(assets/${u.icon}${covered ? "_o" : "_d"}.png)`;
    u.el.classList.toggle("is-cov", covered);
  });
  popPct.textContent = (stage.pct === 0 ? "0" : (stage.pct % 1 ? stage.pct.toFixed(2) : stage.pct)) + "%";
  popLabel.textContent = stage.headline.toUpperCase();
  popNote.textContent = stage.note;
}
const R2R_BY_KEY = Object.fromEntries(R2R_STAGE.map((s) => [s.key, s]));

/* ================= CHART HELPERS ================= */
const chartTip = document.getElementById("chartTip");
const NS = "http://www.w3.org/2000/svg";
function svgEl(tag, attrs, parent) {
  const el = document.createElementNS(NS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(el);
  return el;
}

function lineChart(container, opts) {
  const W = 760, H = 440, m = { t: 34, r: 112, b: 40, l: 48 };
  container.innerHTML = `<h3>${opts.title}</h3><div class="chart-sub">${opts.sub}</div>`;
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": opts.title }, container);
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const xs = opts.series.flatMap((s) => s.data.map((d) => d[0]));
  const ys = opts.series.flatMap((s) => s.data.map((d) => d[1]));
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const y0 = opts.y0 ?? Math.min(...ys), y1 = Math.max(...ys) * 1.04;
  const X = (v) => m.l + ((v - x0) / (x1 - x0)) * iw;
  const Y = (v) => m.t + ih - ((v - y0) / (y1 - y0)) * ih;

  const g = svgEl("g", { class: "axis" }, svg);
  (opts.yTicks || []).forEach((t) => {
    svgEl("line", { x1: m.l, x2: W - m.r, y1: Y(t), y2: Y(t), class: "gridline" }, g);
    svgEl("text", { x: m.l - 8, y: Y(t) + 4, "text-anchor": "end" }, g).textContent = opts.yFmt ? opts.yFmt(t) : t;
  });
  (opts.xTicks || []).forEach((t) => {
    svgEl("text", { x: X(t), y: H - m.b + 22, "text-anchor": "middle" }, g).textContent = t;
  });
  svgEl("line", { x1: m.l, x2: W - m.r, y1: m.t + ih, y2: m.t + ih, class: "axisline" }, svg);

  const paths = {};
  opts.series.forEach((s) => {
    const d = s.data.map((p, i) => `${i ? "L" : "M"}${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join("");
    const p = svgEl("path", { d, class: "line reveal", stroke: s.color }, svg);
    p.style.setProperty("--len", p.getTotalLength());
    const last = s.data[s.data.length - 1];
    const lbl = svgEl("text", { x: X(last[0]) + 10, y: Y(last[1]) + 4, fill: s.color, class: "serieslabel", opacity: 0 }, svg);
    lbl.textContent = s.label;
    const end = svgEl("circle", { cx: X(last[0]), cy: Y(last[1]), r: 4, fill: s.color, opacity: 0 }, svg);
    paths[s.key] = { p, lbl, end };
  });

  const anns = {};
  (opts.annotations || []).forEach((a) => {
    const gg = svgEl("g", { opacity: 0 }, svg);
    svgEl("line", { x1: X(a.x), x2: X(a.x), y1: Y(a.y) - 8, y2: m.t + 6, stroke: "var(--baseline)", "stroke-dasharray": "3 4" }, gg);
    svgEl("text", { x: X(a.x), y: m.t - 4, "text-anchor": "middle", class: "ann", fill: "var(--ink-2)" }, gg).textContent = a.text;
    anns[a.key] = gg;
  });

  const hoverDot = svgEl("circle", { r: 5, fill: "var(--ink)", opacity: 0, "pointer-events": "none" }, svg);
  const shown = new Set();
  svg.addEventListener("pointermove", (e) => {
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    let best = null;
    opts.series.forEach((s) => {
      if (!shown.has(s.key)) return;
      s.data.forEach((d) => {
        const dx = Math.abs(X(d[0]) - px);
        if (!best || dx < best.dx) best = { dx, d, s };
      });
    });
    if (best && best.dx < 40) {
      hoverDot.setAttribute("cx", X(best.d[0]));
      hoverDot.setAttribute("cy", Y(best.d[1]));
      hoverDot.setAttribute("opacity", 1);
      chartTip.innerHTML = `<span style="color:var(--ink)">${best.d[0]}</span><br>${best.s.label}: ${opts.tipFmt ? opts.tipFmt(best.d[1]) : best.d[1]}`;
      chartTip.style.left = Math.min(e.clientX + 14, window.innerWidth - 210) + "px";
      chartTip.style.top = e.clientY + 14 + "px";
      chartTip.classList.add("on");
    } else {
      hoverDot.setAttribute("opacity", 0);
      chartTip.classList.remove("on");
    }
  });
  svg.addEventListener("pointerleave", () => { hoverDot.setAttribute("opacity", 0); chartTip.classList.remove("on"); });

  return {
    show(key) {
      const it = paths[key];
      if (!it || shown.has(key)) return;
      shown.add(key);
      requestAnimationFrame(() => it.p.classList.add("on"));
      setTimeout(() => { it.lbl.setAttribute("opacity", 1); it.end.setAttribute("opacity", 1); }, reduceMotion ? 0 : 1200);
    },
    annotate(key) { if (anns[key]) anns[key].setAttribute("opacity", 1); }
  };
}

const cpi = lineChart(document.getElementById("cpiChart"), {
  title: "The price of the machine against the price of fixing it",
  sub: "BLS CPI, U.S. city average, annual, indexed 1998 = 100 · gaps: 2011, 2021–22 · source: BLS Public Data API",
  series: [
    { key: "app", label: "Major appliances", color: "var(--blue)", data: CPI_APPLIANCES },
    { key: "rep", label: "Repair of household items", color: "var(--accent)", data: CPI_REPAIR }
  ],
  y0: 60, yTicks: [100, 200, 300], xTicks: [1998, 2005, 2012, 2018, 2023],
  tipFmt: (v) => v.toFixed(1)
});

const veh = lineChart(document.getElementById("vehChart"), {
  title: "Average age of U.S. light vehicles",
  sub: "years · DOT/BTS Table 1-26; S&P Global Mobility from 2022",
  series: [{ key: "age", label: "Average age", color: "var(--accent)", data: VEHICLE_AGE }],
  y0: 8, yTicks: [9, 10, 11, 12, 13], xTicks: [2002, 2010, 2016, 2022, 2025],
  yFmt: (t) => t + "y", tipFmt: (v) => v + " years",
  annotations: [{ key: "rec", x: 2025, y: 12.8, text: "12.8y — record, 8th consecutive year" }]
});

/* equilibrium stage: swap between the two charts */
const eqPanels = [...document.querySelectorAll(".eq-panel")];
function eqShow(which) { eqPanels.forEach((p) => p.classList.toggle("on", p.dataset.eq === which)); }

/* ================= ESPR TIMELINE ================= */
const tl = document.getElementById("esprTimeline");
tl.innerHTML = `<h4>EU Ecodesign for Sustainable Products Regulation</h4>` +
  ESPR_TIMELINE.map((r) => `<div class="trow"><div class="ty">${r.year}</div><div class="tb"><div class="tl">${r.label}</div><div class="td">${r.detail}</div></div></div>`).join("");
const trows = [...tl.querySelectorAll(".trow")];
let tlLit = false;
function litTimeline() {
  if (tlLit) return;
  tlLit = true;
  trows.forEach((r, i) => setTimeout(() => r.classList.add("lit"), reduceMotion ? 0 : i * 240));
}

/* ================= SIGNAL STAGE ================= */
const sigContents = [...document.querySelectorAll(".sigstage-content")];
function sigMode(vis) {
  sigContents.forEach((c) => c.classList.toggle("on", c.dataset.vis === vis));
  if (vis === "s3") litTimeline();
}

/* ================= STEP HANDLERS ================= */
const handlers = {
  "eq-app": () => { eqShow("cpi"); cpi.show("app"); },
  "eq-rep": () => { eqShow("cpi"); cpi.show("app"); cpi.show("rep"); },
  "eq-why": () => { eqShow("cpi"); cpi.show("app"); cpi.show("rep"); },
  "eq-veh": () => { eqShow("veh"); veh.show("age"); veh.annotate("rec"); },
  "sig-s1a": () => { sigMode("s1"); popSet(R2R_BY_KEY.none); },
  "sig-s1b": () => { sigMode("s1"); popSet(R2R_BY_KEY.five); },
  "sig-s1c": () => { sigMode("s1"); popSet(R2R_BY_KEY.now); },
  "sig-s1d": () => { sigMode("s1"); popSet(R2R_BY_KEY.fall); },
  "sig-s2": () => sigMode("s2"),
  "sig-s3a": () => sigMode("s3"),
  "sig-s3b": () => sigMode("s3"),
  "sig-s3c": () => sigMode("s3"),
  "sig-w1": () => sigMode("w1"),
  "sig-w2": () => sigMode("w2"),
  "sig-w3": () => sigMode("w3")
};

const stepObs = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    document.querySelectorAll(".step.active").forEach((s) => s !== en.target && s.classList.remove("active"));
    en.target.classList.add("active");
    const h = handlers[en.target.dataset.step];
    if (h) h();
  });
}, { threshold: 0.5 });
document.querySelectorAll(".step").forEach((s) => stepObs.observe(s));

popSet(R2R_BY_KEY.none);
window.addEventListener("resize", () => {
  const active = document.querySelector(".step.active");
  if (active && handlers[active.dataset.step]) handlers[active.dataset.step]();
  else popSet(R2R_BY_KEY.none);
});

/* ================= STILE ================= */
document.getElementById("scaleKey").innerHTML = HORIZONS.map((h) =>
  `<span class="sk"><span class="n">${h.n} · HORIZON ${h.n} — ${h.name.toUpperCase()}</span><span class="g">${h.gloss}</span></span>`
).join("");

const stileBox = document.getElementById("stileRows");
STILE.forEach((s) => {
  const hz = horizonFor(s.score);
  const row = document.createElement("div");
  row.className = "stilerow";
  row.setAttribute("tabindex", "0");
  row.innerHTML =
    `<div class="top"><span class="k">${s.key}</span><span class="n">${s.name}</span>` +
    `<span class="hchip h${hz}">H${hz} · ${HORIZONS[hz - 1].name}</span>` +
    `<span class="sc num">${s.score.toFixed(1)}</span></div>` +
    `<div class="track"><div class="dot" style="left:${((s.score - 1) / 2) * 100}%"></div></div>` +
    `<div class="rationale">${s.rationale}<div class="watch"><b>WATCH FOR</b> ${s.watch}</div></div>` +
    `<div class="hint">CLICK FOR RATIONALE AND WATCH INDICATOR</div>`;
  const toggle = () => {
    row.classList.toggle("open");
    row.querySelector(".hint").textContent = row.classList.contains("open")
      ? "CLICK TO CLOSE" : "CLICK FOR RATIONALE AND WATCH INDICATOR";
  };
  row.addEventListener("click", toggle);
  row.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
  stileBox.appendChild(row);
});
const stileObs = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    [...stileBox.children].forEach((r, i) => setTimeout(() => r.classList.add("shown"), reduceMotion ? 0 : i * 160));
    stileObs.disconnect();
  });
}, { threshold: 0.3 });
stileObs.observe(stileBox);

/* ================= PROGRESS NAV ================= */
const navLinks = [...document.querySelectorAll("#prognav a")];
const navObs = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) navLinks.forEach((a) => a.classList.toggle("on", a.dataset.nav === en.target.id));
  });
}, { rootMargin: "-40% 0px -55% 0px" });
navLinks.map((a) => document.getElementById(a.dataset.nav)).filter(Boolean).forEach((t) => navObs.observe(t));

/* ================= DEEP LINKS (#s=<step-id>) ================= */
(function () {
  const m = location.hash.match(/s=([\w-]+)/);
  if (!m) return;
  if (location.hash.includes("instant")) document.documentElement.classList.add("no-anim");
  const target = document.querySelector(`[data-step="${m[1]}"]`) || document.getElementById(m[1]);
  if (target) setTimeout(() => target.scrollIntoView({ behavior: "instant", block: "center" }), 60);
})();

/* ================= DATA TABLES ================= */
function table(el, head, rows) {
  document.getElementById(el).innerHTML =
    `<table><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>` +
    rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("") + "</tbody></table>";
}
const repMap = Object.fromEntries(CPI_REPAIR);
table("cpiTable", ["Year", "Major appliances", "Repair of household items"],
  CPI_APPLIANCES.map(([y, v]) => [y, v.toFixed(1), (repMap[y] ?? "—").toString()]));
table("vehTable", ["Year", "Average age (years)"], VEHICLE_AGE.map(([y, v]) => [y, v.toFixed(1)]));

})();
