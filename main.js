/* Designing for Durability — scrollytelling engine. No dependencies. */
(function () {
"use strict";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260802);

/* ================= CHARTS ================= */
const chartTip = document.getElementById("chartTip");
const NS = "http://www.w3.org/2000/svg";
function svgEl(tag, attrs, parent) {
  const el = document.createElementNS(NS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(el);
  return el;
}

function lineChart(container, opts) {
  const W = 760, H = 440, m = { t: 34, r: 128, b: 40, l: 48 };
  container.innerHTML = `<h3>${opts.title}</h3><div class="chart-sub">${opts.sub}</div>`;
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": opts.title }, container);
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const xs = opts.series.flatMap((s) => s.data.map((d) => d[0]));
  const ys = opts.series.flatMap((s) => s.data.map((d) => d[1]));
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const y0 = opts.y0 ?? Math.min(...ys), y1 = opts.y1 ?? Math.max(...ys) * 1.04;
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
  if (opts.baseline !== undefined) {
    svgEl("line", { x1: m.l, x2: W - m.r, y1: Y(opts.baseline), y2: Y(opts.baseline),
      stroke: "var(--baseline)", "stroke-dasharray": "4 4" }, svg);
  }

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
    svgEl("text", { x: X(a.x), y: m.t - 4, "text-anchor": a.anchor || "middle", class: "ann", fill: "var(--ink-2)" }, gg).textContent = a.text;
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
      chartTip.style.left = Math.min(e.clientX + 14, window.innerWidth - 230) + "px";
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

const realChart = lineChart(document.getElementById("realChart"), {
  title: "The economics of appliance repair",
  sub: "1998 = 100 · BLS price indexes divided by all-items CPI · gaps are years BLS did not publish",
  series: [
    { key: "appl", label: "Buying a machine", color: "var(--blue)", data: REAL_APPLIANCES },
    { key: "rep", label: "Fixing one", color: "var(--accent)", data: REAL_REPAIR }
  ],
  y0: 30, y1: 200, yTicks: [50, 100, 150], baseline: 100,
  xTicks: [1998, 2005, 2012, 2019, 2026], tipFmt: (v) => v.toFixed(0)
});

/* stage panel switching */
const eqPanels = [...document.querySelectorAll(".eq-panel")];
function eqShow(w) { eqPanels.forEach((p) => p.classList.toggle("on", p.dataset.eq === w)); }

/* ================= STEP HANDLERS ================= */
const handlers = {
  "eq-real": () => { eqShow("real"); realChart.show("appl"); },
  "eq-rep":  () => { eqShow("real"); realChart.show("appl"); realChart.show("rep"); },
  "eq-why":  () => { eqShow("real"); realChart.show("appl"); realChart.show("rep"); }

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

window.addEventListener("resize", () => {
  const a = document.querySelector(".step.active");
  if (a && handlers[a.dataset.step]) handlers[a.dataset.step]();
});

/* ================= STILE ================= */
document.getElementById("scaleKey").innerHTML = HORIZONS.map((h) =>
  `<span class="sk"><span class="n">${h.n} — ${h.name.toUpperCase()}</span><span class="g">${h.gloss}</span></span>`
).join("");

const stileBox = document.getElementById("stileRows");
STILE.forEach((s) => {
  const hz = horizonFor(s.score);
  const row = document.createElement("div");
  row.className = "stilerow";
  row.setAttribute("tabindex", "0");
  row.innerHTML =
    `<div class="top"><span class="k">${s.key}</span><span class="n">${s.name}<span class="nsub">${s.short}</span></span>` +
    `<span class="hchip h${hz}">${HORIZONS[hz - 1].name}</span>` +
    `<span class="sc num">${s.score.toFixed(1)}</span></div>` +
    `<div class="track"><div class="dot" style="left:${((s.score - 1) / 2) * 100}%"></div></div>` +
    `<div class="rationale">${s.rationale}<div class="watch"><b>WHAT TO WATCH</b> ${s.watch}</div></div>` +
    `<div class="hint">CLICK TO OPEN</div>`;
  const toggle = () => {
    row.classList.toggle("open");
    row.querySelector(".hint").textContent = row.classList.contains("open") ? "CLICK TO CLOSE" : "CLICK TO OPEN";
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

/* ================= DEEP LINKS ================= */
(function () {
  const m = location.hash.match(/s=([\w-]+)/);
  if (!m) return;
  if (location.hash.includes("instant")) document.documentElement.classList.add("no-anim");
  const t = document.querySelector(`[data-step="${m[1]}"]`) || document.getElementById(m[1]);
  if (t) setTimeout(() => t.scrollIntoView({ behavior: "instant", block: "center" }), 60);
})();

/* ================= DATA TABLES ================= */
function table(el, head, rows) {
  document.getElementById(el).innerHTML =
    `<table><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>` +
    rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("") + "</tbody></table>";
}
const repMap = Object.fromEntries(REAL_REPAIR);
table("realTable", ["Year", "Buying (real)", "Fixing (real)"],
  REAL_APPLIANCES.map(([y, v]) => [y, v.toFixed(1), (repMap[y] ?? "—").toString()]));

})();
