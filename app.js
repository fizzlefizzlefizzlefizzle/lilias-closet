// Lilia's Closet — vanilla JS, no build step needed

const SECTIONS = [
  { key: "Tops",    label: "Tops",    icon: "👚", sublabel: "Shirts & Jackets" },
  { key: "Bottoms", label: "Bottoms", icon: "👖", sublabel: "Pants & Shorts" },
  { key: "Shoes",   label: "Shoes",   icon: "👟", sublabel: "Shoes & Sneakers" },
];

// ── State ─────────────────────────────────────────────────────────
let state = { items: { Tops:[], Bottoms:[], Shoes:[] }, selected: { Tops:null, Bottoms:null, Shoes:null } };
let page = "home"; // "home" | "Tops" | "Bottoms" | "Shoes"
let uid = Date.now();

function loadState() {
  try {
    const s = localStorage.getItem("lilias-closet-v2");
    if (s) state = JSON.parse(s);
  } catch(_) {}
}

function saveState() {
  try { localStorage.setItem("lilias-closet-v2", JSON.stringify(state)); } catch(_) {}
}

// ── Render ────────────────────────────────────────────────────────
function render() {
  const root = document.getElementById("root");
  root.innerHTML = "";
  root.appendChild(page === "home" ? buildHome() : buildSection(page));
}

// ── HOME ──────────────────────────────────────────────────────────
function buildHome() {
  const total = Object.values(state.items).reduce((s,a) => s + a.length, 0);

  const wrap = el("div", { style: css.page });

  // Header
  const header = el("header", { style: css.header });
  const headerTop = el("div", { style: css.headerTop });
  headerTop.appendChild(el("span", { style: "font-size:22px;color:#c97fa0", textContent: "✿" }));
  const titleWrap = el("div");
  titleWrap.appendChild(el("h1", { style: css.title, textContent: "Lilia's Closet" }));
  titleWrap.appendChild(el("p", { style: css.sub, textContent: `${total} piece${total !== 1 ? "s" : ""} saved` }));
  headerTop.appendChild(titleWrap);
  header.appendChild(headerTop);

  // Tabs
  const tabs = el("div", { style: css.tabs });
  SECTIONS.forEach(sec => {
    const count = state.items[sec.key].length;
    const tab = el("button", { style: css.tab });
    tab.appendChild(el("span", { style: "font-size:18px", textContent: sec.icon }));
    tab.appendChild(el("span", { style: "font-size:11px", textContent: sec.label }));
    if (count > 0) tab.appendChild(el("span", { style: css.tabBadge, textContent: count }));
    tab.addEventListener("click", () => { page = sec.key; render(); });
    tabs.appendChild(tab);
  });
  header.appendChild(tabs);
  wrap.appendChild(header);

  // Outfit slots
  const outfitWrap = el("div", { style: css.outfitWrap });
  SECTIONS.forEach((sec, i) => {
    const sel = state.selected[sec.key];
    const slot = el("div", { style: css.slot + (i > 0 ? ";border-top:1.5px solid rgba(240,216,229,0.6)" : "") });
    slot.addEventListener("click", () => { page = sec.key; render(); });

    if (sel) {
      const img = el("img", { style: css.slotImg });
      img.src = sel.url;
      img.alt = sel.name;
      slot.appendChild(img);
    } else {
      const empty = el("div", { style: css.slotEmpty });
      empty.appendChild(el("span", { style: "font-size:28px", textContent: sec.icon }));
      empty.appendChild(el("span", { style: "font-size:11px;color:#c9a8b5;margin-top:6px",
        textContent: state.items[sec.key].length > 0 ? "Tap to pick" : `Add ${sec.label}` }));
      slot.appendChild(empty);
    }

    // overlay label
    const overlay = el("div", { style: css.slotOverlay });
    overlay.appendChild(el("span", { style: css.slotLabel, textContent: sec.label }));
    if (sel) overlay.appendChild(el("span", { style: css.slotName, textContent: sel.name }));
    slot.appendChild(overlay);

    outfitWrap.appendChild(slot);
  });
  wrap.appendChild(outfitWrap);
  return wrap;
}

// ── SECTION PAGE ──────────────────────────────────────────────────
function buildSection(key) {
  const sec = SECTIONS.find(s => s.key === key);
  const items = state.items[key];
  const selected = state.selected[key];

  const wrap = el("div", { style: css.pgPage });

  // Top bar
  const topBar = el("div", { style: css.topBar });
  const backBtn = el("button", { style: css.backBtn, textContent: "← Back" });
  backBtn.addEventListener("click", () => { page = "home"; render(); });
  topBar.appendChild(backBtn);

  const titleWrap = el("div", { style: "flex:1;text-align:center" });
  titleWrap.appendChild(el("h2", { style: css.pgTitle, textContent: `${sec.icon} ${sec.label}` }));
  titleWrap.appendChild(el("p",  { style: css.pgSub,   textContent: sec.sublabel }));
  topBar.appendChild(titleWrap);

  // Upload button
  const uploadId = `upload-${key}`;
  const uploadLabel = el("label", { style: css.addBtn, textContent: "+ Add", htmlFor: uploadId });
  const uploadInput = el("input");
  uploadInput.type = "file";
  uploadInput.id = uploadId;
  uploadInput.accept = "image/*";
  uploadInput.multiple = true;
  uploadInput.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0";
  uploadInput.addEventListener("change", (e) => {
    Array.from(e.target.files).forEach(file => {
      const r = new FileReader();
      r.onload = ev => {
        const item = { id: ++uid, url: ev.target.result, name: file.name.replace(/\.[^.]+$/, "") };
        state.items[key].push(item);
        if (state.items[key].length === 1) state.selected[key] = item;
        saveState();
        render();
      };
      r.readAsDataURL(file);
    });
    e.target.value = "";
  });
  topBar.appendChild(uploadLabel);
  topBar.appendChild(uploadInput);
  wrap.appendChild(topBar);

  // Empty state
  if (items.length === 0) {
    const emptyLabel = el("label", { style: css.emptyBox, htmlFor: uploadId });
    emptyLabel.appendChild(el("span", { style: "font-size:52px", textContent: sec.icon }));
    emptyLabel.appendChild(el("p", { style: "color:#c9a8b5;font-size:14px;margin-top:14px;font-family:'DM Sans',sans-serif;text-align:center",
      textContent: `Tap to add your first ${sec.label.toLowerCase()}` }));
    wrap.appendChild(emptyLabel);
    return wrap;
  }

  // Grid
  const scroll = el("div", { style: css.scroll });
  const grid = el("div", { style: css.grid });

  items.forEach(item => {
    const isSel = selected?.id === item.id;
    const card = el("div", { style: css.card + (isSel ? ";border-color:#c97fa0;box-shadow:0 2px 16px rgba(201,127,160,0.25)" : "") });

    const imgWrap = el("div", { style: "position:relative" });
    const img = el("img", { style: css.cardImg });
    img.src = item.url;
    img.alt = item.name;
    img.addEventListener("click", () => {
      state.selected[key] = item;
      saveState();
      render();
    });
    imgWrap.appendChild(img);

    if (isSel) {
      imgWrap.appendChild(el("div", { style: css.badge, textContent: "✓ On" }));
    }

    // Delete button
    const delBtn = el("button", { style: css.delBtn, textContent: "✕" });
    delBtn.addEventListener("click", () => {
      if (confirm(`Delete "${item.name}"?`)) {
        state.items[key] = state.items[key].filter(i => i.id !== item.id);
        if (state.selected[key]?.id === item.id) {
          state.selected[key] = state.items[key][0] ?? null;
        }
        saveState();
        render();
      }
    });
    imgWrap.appendChild(delBtn);
    card.appendChild(imgWrap);

    // Name (tap to rename)
    const nameEl = el("span", { style: css.cardName, textContent: item.name });
    nameEl.addEventListener("click", () => {
      const newName = prompt("Rename:", item.name);
      if (newName && newName.trim()) {
        state.items[key] = state.items[key].map(i => i.id === item.id ? { ...i, name: newName.trim() } : i);
        if (state.selected[key]?.id === item.id) state.selected[key].name = newName.trim();
        saveState();
        render();
      }
    });
    card.appendChild(nameEl);

    // Move select
    const moveSelect = el("select", { style: css.moveSelect });
    SECTIONS.forEach(s => {
      const opt = el("option", { value: s.key, textContent: s.label });
      if (s.key === key) opt.selected = true;
      moveSelect.appendChild(opt);
    });
    moveSelect.addEventListener("change", (e) => {
      const to = e.target.value;
      if (to === key) return;
      state.items[key] = state.items[key].filter(i => i.id !== item.id);
      state.items[to].push(item);
      if (state.selected[key]?.id === item.id) state.selected[key] = state.items[key][0] ?? null;
      saveState();
      render();
    });
    card.appendChild(moveSelect);

    // Wear / Remove button
    const wearBtn = el("button", { style: css.wearBtn, textContent: isSel ? "Remove" : "Wear this" });
    wearBtn.addEventListener("click", () => {
      state.selected[key] = isSel ? null : item;
      saveState();
      render();
    });
    card.appendChild(wearBtn);

    grid.appendChild(card);
  });

  scroll.appendChild(grid);
  wrap.appendChild(scroll);
  return wrap;
}

// ── Helpers ───────────────────────────────────────────────────────
function el(tag, props = {}) {
  const e = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === "style") e.style.cssText = v;
    else e[k] = v;
  });
  return e;
}

// ── Styles ────────────────────────────────────────────────────────
const css = {
  // Home
  page:       "height:100vh;display:flex;flex-direction:column;background:#fdf6f9;font-family:'DM Sans',sans-serif;overflow:hidden",
  header:     "background:rgba(255,255,255,0.95);backdrop-filter:blur(12px);border-bottom:1px solid #f0d8e5;flex-shrink:0;z-index:10",
  headerTop:  "display:flex;align-items:center;gap:10px;padding:14px 18px 8px",
  title:      "font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:300;margin:0;letter-spacing:0.04em;color:#3d2535",
  sub:        "font-size:10px;color:#b89fa8;margin:0;letter-spacing:0.08em;text-transform:uppercase",
  tabs:       "display:flex;border-top:1px solid #f0d8e5",
  tab:        "flex:1;background:none;border:none;border-right:1px solid #f0d8e5;padding:8px 4px;color:#8c6070;cursor:pointer;font-family:'DM Sans',sans-serif;display:flex;flex-direction:column;align-items:center;gap:2px",
  tabBadge:   "font-size:9px;background:#fdeef4;color:#c97fa0;border-radius:8px;padding:1px 5px;font-weight:600",
  outfitWrap: "flex:1;display:flex;flex-direction:column;overflow:hidden",
  slot:       "flex:1;position:relative;overflow:hidden;cursor:pointer",
  slotImg:    "width:100%;height:100%;object-fit:cover;object-position:center top;display:block",
  slotEmpty:  "width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fdf0f5",
  slotOverlay:"position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(61,37,53,0.45));padding:16px 12px 8px;display:flex;align-items:flex-end;gap:6px",
  slotLabel:  "font-size:12px;font-weight:600;color:#fff;letter-spacing:0.06em;text-transform:uppercase",
  slotName:   "font-size:11px;color:rgba(255,255,255,0.75);overflow:hidden;text-overflow:ellipsis;white-space:nowrap",

  // Section page
  pgPage:  "min-height:100vh;background:linear-gradient(160deg,#fdf6f9 0%,#fbeef4 60%,#f5eaf6 100%);font-family:'DM Sans',sans-serif;display:flex;flex-direction:column",
  topBar:  "display:flex;align-items:center;gap:8px;padding:12px 14px;background:rgba(255,255,255,0.92);backdrop-filter:blur(10px);border-bottom:1px solid #f0d8e5;position:sticky;top:0;z-index:10",
  backBtn: "background:none;border:none;color:#c97fa0;font-size:15px;cursor:pointer;padding:6px 2px;font-family:'DM Sans',sans-serif;flex-shrink:0",
  pgTitle: "font-family:'Cormorant Garamond',serif;font-size:19px;font-weight:400;margin:0;color:#3d2535",
  pgSub:   "font-size:10px;color:#b89fa8;margin:0;letter-spacing:0.05em",
  addBtn:  "background:#c97fa0;color:#fff;border-radius:12px;padding:7px 14px;font-size:13px;font-family:'DM Sans',sans-serif;font-weight:500;flex-shrink:0;display:inline-block;cursor:pointer",
  emptyBox:"flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;margin:24px;border:2px dashed #e8c4d4;border-radius:20px;background:rgba(255,255,255,0.5);min-height:300px;cursor:pointer",
  scroll:  "flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch",
  grid:    "display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:14px",
  card:    "border-radius:14px;overflow:hidden;background:#fff;border:2px solid #f0d8e5;box-shadow:0 2px 8px rgba(180,100,130,0.07);display:flex;flex-direction:column",
  cardImg: "width:100%;aspect-ratio:1;object-fit:cover;display:block;cursor:pointer",
  badge:   "position:absolute;top:5px;left:5px;background:#c97fa0;color:#fff;font-size:9px;padding:2px 7px;border-radius:7px;font-weight:700",
  delBtn:  "position:absolute;top:5px;right:5px;background:rgba(255,255,255,0.92);border:none;border-radius:7px;width:24px;height:24px;font-size:10px;color:#c97fa0;cursor:pointer;display:flex;align-items:center;justify-content:center;font-weight:700",
  cardName:"font-size:11px;font-weight:500;padding:5px 7px 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;color:#3d2535",
  moveSelect:"font-size:10px;border:1px solid #f0d8e5;border-radius:7px;padding:2px 3px;margin:2px 6px;color:#8c6070;background:#fdf6f9;cursor:pointer;font-family:'DM Sans',sans-serif",
  wearBtn: "margin:3px 6px 7px;background:#fdeef4;border:none;border-radius:9px;padding:5px;font-size:11px;color:#c97fa0;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:500",
};

// ── Boot ──────────────────────────────────────────────────────────
loadState();
render();
