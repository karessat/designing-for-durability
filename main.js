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

/* ================= POPULATION STAGE ================= */
const popInner = document.getElementById("popInner");
const popNote = document.getElementById("popNote");
const popTip = document.getElementById("popTip");

// Build the 100-unit roster from weighted types.
const roster = [];
POP_TYPES.forEach(([icon, label, n]) => { for (let i = 0; i < n; i++) roster.push({ icon, label }); });
while (roster.length > POP.total) roster.splice(Math.floor(rand() * roster.length), 1);
// Shuffle deterministically.
for (let i = roster.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [roster[i], roster[j]] = [roster[j], roster[i]];
}
// Assign fates: first `faulty` are faulty (first `earlyFail` of those failed <5y), next `working` still worked.
roster.forEach((u, i) => {
  u.id = i;
  u.fate = i < POP.faulty ? "faulty" : i < POP.faulty + POP.working ? "working" : "other";
  u.early = i < POP.earlyFail;
  u.jx = rand() * 8 - 4;
  u.jy = rand() * 8 - 4;
});
// Visual shuffle for on-screen order (so fates aren't clustered).
const order = roster.map((_, i) => i);
for (let i = order.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [order[i], order[j]] = [order[j], order[i]];
}

const VARIANT = { w: "_ws", faulty: "_o", working: "_b", dim: "_d" };
const units = roster.map((u) => {
  const el = document.createElement("div");
  el.className = "unit is-hidden";
  el.style.backgroundImage = `url(assets/${u.icon}_ws.png)`;
  el.setAttribute("role", "img");
  el.setAttribute("aria-label", u.label);
  el.dataset.id = u.id;
  popInner.appendChild(el);
  u.el = el;
  return u;
});

const fateText = {
  faulty: "replaced because it was faulty",
  working: "still worked when replaced",
  other: "replaced for a reason the study does not report"
};
function showTip(u, x, y) {
  popTip.innerHTML = `<span class="t">UNIT ${String(u.id + 1).padStart(3, "0")} · ${u.label.toUpperCase()}</span><br>` +
    fateText[u.fate] + (u.early ? "<br>failed within five years of purchase" : "") +
    `<br><span style="opacity:.65">illustrative unit · shares from UBA 2016</span>`;
  const pad = 14;
  popTip.style.left = Math.min(x + pad, window.innerWidth - 260) + "px";
  popTip.style.top = Math.min(y + pad, window.innerHeight - 110) + "px";
  popTip.classList.add("on");
}
popInner.addEventListener("pointermove", (e) => {
  const t = e.target.closest(".unit");
  if (t && !t.classList.contains("is-hidden")) showTip(roster[+t.dataset.id], e.clientX, e.clientY);
  else popTip.classList.remove("on");
});
popInner.addEventListener("pointerleave", () => popTip.classList.remove("on"));
popInner.addEventListener("click", (e) => {
  const t = e.target.closest(".unit");
  if (t) showTip(roster[+t.dataset.id], e.clientX, e.clientY);
});

function layoutGrid() {
  const W = popInner.clientWidth, H = popInner.clientHeight;
  const cols = W < 640 ? 10 : 10, rows = 10;
  const margin = Math.min(W, H) < 700 ? 40 : 90;
  const cw = (W - margin * 2) / cols, ch = (H - margin * 2 - 40) / rows;
  units.forEach((u) => {
    const pos = order.indexOf(u.id);
    const c = pos % cols, r = Math.floor(pos / cols);
    u.gx = margin + c * cw + cw / 2 - 26 + u.jx;
    u.gy = margin + r * ch + ch / 2 - 26 + u.jy;
  });
}
function setTint(u, variant) {
  u.el.style.backgroundImage = `url(assets/${u.icon}${variant}.png)`;
}
function popMode(mode) {
  layoutGrid();
  const W = popInner.clientWidth, H = popInner.clientHeight;
  units.forEach((u) => {
    const el = u.el;
    el.classList.remove("is-pulse", "is-hidden");
    let tint = "_ws";
    if (mode === "single") {
      if (u.id === 0) {
        const s = Math.min(W, H) * 0.5;
        el.style.transform = `translate(${W / 2 - 26}px, ${H / 2 - 26}px) scale(${s / 52})`;
        el.style.backgroundImage = `url(assets/${u.icon}_w.png)`;
      } else {
        el.style.transform = `translate(${u.gx}px, ${u.gy}px) scale(0.2)`;
        el.classList.add("is-hidden");
      }
      return;
    }
    el.style.transform = `translate(${u.gx}px, ${u.gy}px) scale(1)`;
    if (mode === "faulty" && u.fate === "faulty") tint = "_o";
    if (mode === "working") {
      if (u.fate === "faulty") tint = "_o";
      if (u.fate === "working") tint = "_b";
    }
    if (mode === "early") {
      if (u.early) { tint = "_o"; el.classList.add("is-pulse"); }
      else tint = "_d";
    }
    if (mode === "dim") tint = "_d";
    if (mode === "complex") {
      tint = ["robovac", "smarthub"].includes(u.icon) ? "_ws" : "_d";
    }
    setTint(u, tint);
  });
  popNote.textContent = mode === "single" ? "" :
    "Illustrative population of 100 replaced appliances. Shares: UBA / Öko-Institut 2016 (Germany). Hover or tap a unit.";
}

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
  const W = 760, H = 440, m = { t: 34, r: 108, b: 40, l: 46 };
  container.innerHTML =
    `<h3>${opts.title}</h3><div class="chart-sub">${opts.sub}</div>`;
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
    const len = p.getTotalLength();
    p.style.setProperty("--len", len);
    const last = s.data[s.data.length - 1];
    const lbl = svgEl("text", {
      x: X(last[0]) + 10, y: Y(last[1]) + 4, fill: s.color,
      class: "serieslabel", opacity: 0
    }, svg);
    lbl.textContent = s.label;
    const end = svgEl("circle", { cx: X(last[0]), cy: Y(last[1]), r: 4, fill: s.color, opacity: 0 }, svg);
    paths[s.key] = { p, lbl, end, s };
  });

  // annotations, revealed by key
  const anns = {};
  (opts.annotations || []).forEach((a) => {
    const gg = svgEl("g", { opacity: 0, class: "ann-g" }, svg);
    svgEl("line", { x1: X(a.x), x2: X(a.x), y1: Y(a.y) - 8, y2: m.t + 6, stroke: "var(--baseline)", "stroke-dasharray": "3 4" }, gg);
    const t = svgEl("text", { x: X(a.x), y: m.t - 4, "text-anchor": "middle", class: "ann", fill: "var(--ink-2)" }, gg);
    t.textContent = a.text;
    anns[a.key] = gg;
  });

  // hover layer
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
      chartTip.style.left = Math.min(e.clientX + 14, window.innerWidth - 200) + "px";
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

/* ---- CPI chart ---- */
const cpi = lineChart(document.getElementById("cpiChart"), {
  title: "The price of the machine vs. the price of fixing it",
  sub: "BLS CPI, U.S. city average, annual, indexed 1998 = 100 · gaps: 2011, 2021–22 · source: BLS Public Data API",
  series: [
    { key: "app", label: "Major appliances", color: "var(--blue)", data: CPI_APPLIANCES },
    { key: "rep", label: "Repair of household items", color: "var(--accent)", data: CPI_REPAIR }
  ],
  y0: 60, yTicks: [100, 200, 300], xTicks: [1998, 2005, 2012, 2018, 2023],
  yFmt: (t) => t, tipFmt: (v) => v.toFixed(1),
  annotations: [{ key: "tariff", x: 2018, y: 85.2, text: "2018: washer tariffs, +12% in months" }]
});

/* ---- vehicle age chart ---- */
const veh = lineChart(document.getElementById("vehChart"), {
  title: "Average age of U.S. light vehicles",
  sub: "years · DOT/BTS Table 1-26; S&P Global Mobility from 2022",
  series: [{ key: "age", label: "Average age", color: "var(--accent)", data: VEHICLE_AGE }],
  y0: 8, yTicks: [9, 10, 11, 12, 13], xTicks: [2002, 2010, 2016, 2022, 2025],
  yFmt: (t) => t + "y", tipFmt: (v) => v + " years",
  annotations: [{ key: "rec", x: 2025, y: 12.8, text: "12.8y — record, 8th consecutive year" }]
});

/* ---- coverage bars ---- */
const covBox = document.getElementById("covBars");
covBox.innerHTML = `<h3 style="font-family:var(--disp);font-size:17px;text-align:left">Americans covered by an enforceable right-to-repair law</h3>
<div class="chart-sub" style="text-align:left">share of U.S. population · PIRG calculations</div>`;
const covFills = R2R_COVERAGE.map((r) => {
  const row = document.createElement("div");
  row.className = "covrow" + (r.projected ? " projected" : "");
  row.innerHTML = `<div class="cl"><span>${r.label}${r.projected ? " · PROJECTED" : ""}</span><span class="v num">${r.value === 0 ? "0%" : (r.projected ? "≥" : "") + r.value + "%"}</span></div>
    <div class="track"><div class="fill"></div></div><div class="note">${r.note}</div>`;
  covBox.appendChild(row);
  return { el: row.querySelector(".fill"), v: r.value };
});
let covShown = false;
function showCov() {
  if (covShown) return;
  covShown = true;
  covFills.forEach((f, i) => setTimeout(() => { f.el.style.width = (f.v / 40) * 100 + "%"; }, reduceMotion ? 0 : i * 220));
}

/* ================= SIGNALS STAGE ================= */
const sigContents = [...document.querySelectorAll(".sigstage-content")];
function sigMode(vis) {
  sigContents.forEach((c) => c.classList.toggle("on", c.dataset.vis === vis));
  if (vis === "s1") showCov();
  if (vis === "s3") veh.show("age"), veh.annotate("rec");
}

/* ================= STEP OBSERVER ================= */
const handlers = {
  "pop-single": () => popMode("single"),
  "pop-grid": () => popMode("grid"),
  "pop-faulty": () => popMode("faulty"),
  "pop-working": () => popMode("working"),
  "pop-early": () => popMode("early"),
  "pop-dim": () => popMode("dim"),
  "pop-complex": () => popMode("complex"),
  "cpi-app": () => cpi.show("app"),
  "cpi-rep": () => { cpi.show("app"); cpi.show("rep"); },
  "cpi-tariff": () => { cpi.show("app"); cpi.show("rep"); cpi.annotate("tariff"); },
  "cpi-all": () => {},
  "sig-w1": () => sigMode("w1"),
  "sig-w2": () => sigMode("w2"),
  "sig-w3": () => sigMode("w3"),
  "sig-s1": () => sigMode("s1"),
  "sig-s2": () => sigMode("s2"),
  "sig-s3": () => sigMode("s3")
};

const stepObs = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) {
      const id = en.target.dataset.step;
      document.querySelectorAll(".step.active").forEach((s) => s !== en.target && s.classList.remove("active"));
      en.target.classList.add("active");
      if (handlers[id]) handlers[id]();
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll(".step").forEach((s) => stepObs.observe(s));

/* initial state */
popMode("single");
window.addEventListener("resize", () => {
  const active = document.querySelector(".step.active");
  if (active && handlers[active.dataset.step]) handlers[active.dataset.step]();
});

/* ================= STILE ================= */
const stileBox = document.getElementById("stileRows");
STILE.forEach((s) => {
  const row = document.createElement("div");
  row.className = "stilerow";
  row.setAttribute("tabindex", "0");
  row.innerHTML = `<div class="top"><span class="k">${s.key}</span><span class="n">${s.name}</span><span class="sc num">${s.score.toFixed(1)}</span></div>
    <div class="track"><div class="dot" style="left:${((s.score - 1) / 2) * 100}%"></div></div>
    <div class="rationale">${s.rationale}</div>
    <div class="hint">CLICK FOR RATIONALE</div>`;
  const toggle = () => {
    row.classList.toggle("open");
    row.querySelector(".hint").textContent = row.classList.contains("open") ? "CLICK TO CLOSE" : "CLICK FOR RATIONALE";
  };
  row.addEventListener("click", toggle);
  row.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
  stileBox.appendChild(row);
});
const stileObs = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) {
      [...stileBox.children].forEach((r, i) => setTimeout(() => r.classList.add("shown"), reduceMotion ? 0 : i * 160));
      stileObs.disconnect();
    }
  });
}, { threshold: 0.3 });
stileObs.observe(stileBox);

/* ================= PROGRESS NAV ================= */
const navLinks = [...document.querySelectorAll("#prognav a")];
const navTargets = navLinks.map((a) => document.getElementById(a.dataset.nav)).filter(Boolean);
const navObs = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) {
      navLinks.forEach((a) => a.classList.toggle("on", a.dataset.nav === en.target.id));
    }
  });
}, { rootMargin: "-40% 0px -55% 0px" });
navTargets.forEach((t) => navObs.observe(t));

/* ================= DEEP LINKS (#s=<step-id>) ================= */
(function () {
  const m = location.hash.match(/s=([\w-]+)/);
  if (!m) return;
  if (location.hash.includes("instant")) document.documentElement.classList.add("no-anim");
  const target = document.querySelector(`[data-step="${m[1]}"]`) || document.getElementById(m[1]);
  if (target) setTimeout(() => target.scrollIntoView({ behavior: "instant", block: "center" }), 60);
})();

/* ================= DATA TABLES (accessibility) ================= */
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
