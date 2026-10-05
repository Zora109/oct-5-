// Fridge Keeper: inventory, expiry tracking, recipe suggestions and meal planning.
// All data lives in the browser's localStorage.

const STORAGE_KEY = "fridge-keeper-items";
const DEFAULT_UNKNOWN_DAYS = 7;
// Items lasting longer than this are treated as "bulk" (rice, flour...) and are not
// used up by a single meal when planning.
const BULK_DAYS = 30;

// ---------- Date helpers (all dates are "YYYY-MM-DD" strings in local time) ----------

function todayStr() {
  const d = new Date();
  return toDateStr(d);
}

function toDateStr(d) {
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return toDateStr(new Date(y, m - 1, d + n));
}

function daysBetween(fromStr, toStr) {
  const [y1, m1, d1] = fromStr.split("-").map(Number);
  const [y2, m2, d2] = toStr.split("-").map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}

function prettyDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

// ---------- Ingredient knowledge ----------

// Map whatever the user typed to a key in SHELF_LIFE, or null if unknown.
function normalize(name) {
  const n = name.trim().toLowerCase();
  if (SHELF_LIFE[n]) return n;
  if (ALIASES[n]) return ALIASES[n];
  if (n.endsWith("es") && SHELF_LIFE[n.slice(0, -2)]) return n.slice(0, -2);
  if (n.endsWith("s") && SHELF_LIFE[n.slice(0, -1)]) return n.slice(0, -1);
  return null;
}

// How many days an ingredient keeps in a location. Returns null if it shouldn't go there.
function shelfDays(key, storage) {
  if (!key) return DEFAULT_UNKNOWN_DAYS;
  return SHELF_LIFE[key][storage];
}

function status(daysLeft) {
  if (daysLeft < 0) return { cls: "expired", label: `Expired ${-daysLeft}d ago` };
  if (daysLeft === 0) return { cls: "urgent", label: "Use today" };
  if (daysLeft === 1) return { cls: "urgent", label: "Use by tomorrow" };
  if (daysLeft <= 3) return { cls: "soon", label: `${daysLeft} days left` };
  return { cls: "fresh", label: `${daysLeft} days left` };
}

// Weight for recipe scoring: something expiring today is worth far more than something
// that keeps for a month.
function urgency(daysLeft) {
  return 1 + 6 / (Math.max(daysLeft, 0) + 1);
}

// ---------- State ----------

let items = load();

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage unavailable (private mode etc.) - app still works for this session.
  }
  renderAll();
}

function daysLeft(item, onDate = todayStr()) {
  return daysBetween(onDate, item.expires);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---------- Add form ----------

const form = document.getElementById("add-form");
const fName = document.getElementById("f-name");
const fQty = document.getElementById("f-qty");
const fBought = document.getElementById("f-bought");
const fStorage = document.getElementById("f-storage");
const fExpires = document.getElementById("f-expires");
const fHint = document.getElementById("f-hint");
let expiresEditedByHand = false;

document.getElementById("known-ingredients").innerHTML =
  Object.keys(SHELF_LIFE).sort().map(k => `<option value="${k}">`).join("");

function resetForm() {
  form.reset();
  fBought.value = todayStr();
  expiresEditedByHand = false;
  updateFormHint();
}

// Recompute the suggested use-by date and storage tip from name + storage + bought date.
function updateFormHint() {
  const key = normalize(fName.value);
  const storage = fStorage.value;
  const bought = fBought.value || todayStr();

  if (!fName.value.trim()) {
    fHint.textContent = "Type an ingredient and the use-by date fills in automatically.";
    return;
  }

  let days = shelfDays(key, storage);
  const msgs = [];

  if (!key) {
    msgs.push(`I don't know "${fName.value.trim()}" yet, so I guessed ${DEFAULT_UNKNOWN_DAYS} days. Change the date if needed.`);
  } else {
    const info = SHELF_LIFE[key];
    if (days == null) {
      msgs.push(`⚠️ ${key} doesn't keep well in the ${storage}. Best place: ${info.best} (${info.best === "pantry" ? "cool, dry spot" : info.best}).`);
      days = info[info.best];
    } else if (storage !== info.best) {
      msgs.push(`Tip: ${key} keeps best in the ${info.best} (${info[info.best]} days). In the ${storage}: ${days} days.`);
    } else {
      msgs.push(`${key} keeps about ${days} days in the ${storage}.`);
    }
    if (info.freezer && storage !== "freezer" && info.freezer > days * 3) {
      msgs.push(`Won't use it soon? Freezing keeps it ~${info.freezer} days.`);
    }
  }

  if (!expiresEditedByHand) fExpires.value = addDays(bought, days);
  fHint.textContent = msgs.join(" ");
}

fName.addEventListener("input", () => {
  // Jump to the recommended storage location when the name is recognised.
  const key = normalize(fName.value);
  if (key) fStorage.value = SHELF_LIFE[key].best;
  updateFormHint();
});
fStorage.addEventListener("change", updateFormHint);
fBought.addEventListener("change", updateFormHint);
fExpires.addEventListener("input", () => { expiresEditedByHand = true; });

form.addEventListener("submit", e => {
  e.preventDefault();
  const key = normalize(fName.value);
  items.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    name: fName.value.trim(),
    key,
    category: key ? SHELF_LIFE[key].category : "Other",
    qty: fQty.value.trim(),
    storage: fStorage.value,
    bought: fBought.value,
    expires: fExpires.value,
  });
  save();
  resetForm();
  fName.focus();
});

// ---------- Inventory list ----------

const inventoryEl = document.getElementById("inventory");
const filterEl = document.getElementById("filter-storage");
filterEl.addEventListener("change", renderInventory);

function renderInventory() {
  const filter = filterEl.value;
  const shown = items
    .filter(i => filter === "all" || i.storage === filter)
    .sort((a, b) => a.expires.localeCompare(b.expires));

  const counts = { expired: 0, urgent: 0, soon: 0 };
  items.forEach(i => { const s = status(daysLeft(i)).cls; if (s in counts) counts[s]++; });
  document.getElementById("summary").innerHTML = `
    <span><b>${items.length}</b> items</span>
    <span class="urgent"><b>${counts.urgent}</b> use within a day</span>
    <span class="soon"><b>${counts.soon}</b> within 3 days</span>
    <span class="expired"><b>${counts.expired}</b> expired</span>`;

  if (!shown.length) {
    inventoryEl.innerHTML = `<li class="empty">Nothing here yet. Add what you bought above.</li>`;
    return;
  }

  inventoryEl.innerHTML = shown.map(i => {
    const left = daysLeft(i);
    const s = status(left);
    const info = i.key && SHELF_LIFE[i.key];
    // Offer freezing when something will spoil soon and the freezer would save it.
    const canFreeze = info && info.freezer && i.storage !== "freezer" && left >= 0 && left <= 3;
    const tip = canFreeze ? `<div class="tip">Can't cook it in time? Freeze it for ~${info.freezer} more days.</div>` : "";
    return `
      <li class="item">
        <span class="bar ${s.cls}"></span>
        <div>
          <div class="name">${escapeHtml(i.name)} ${i.qty ? `<span class="meta">· ${escapeHtml(i.qty)}</span>` : ""}</div>
          <div class="meta">${i.category} · ${i.storage} · bought ${prettyDate(i.bought)} · use by ${prettyDate(i.expires)}</div>
          ${tip}
        </div>
        <div class="actions">
          <span class="status ${s.cls}">${s.label}</span>
          ${canFreeze ? `<button class="small" data-freeze="${i.id}">Freeze</button>` : ""}
          <button class="small" data-remove="${i.id}" title="Used up or thrown away">✓ Used</button>
        </div>
      </li>`;
  }).join("");
}

inventoryEl.addEventListener("click", e => {
  const removeId = e.target.dataset.remove;
  const freezeId = e.target.dataset.freeze;
  if (removeId) {
    items = items.filter(i => i.id !== removeId);
    save();
  } else if (freezeId) {
    const item = items.find(i => i.id === freezeId);
    item.storage = "freezer";
    item.expires = addDays(todayStr(), SHELF_LIFE[item.key].freezer);
    save();
  }
});

// ---------- Recipe matching ----------

// For one recipe, pick the best item from `pool` for each ingredient (the one expiring soonest
// but still good on `onDate`). Returns score details used for ranking.
function matchRecipe(recipe, pool, onDate) {
  const usable = pool.filter(i => i.key && daysLeft(i, onDate) >= 0);
  const pick = key => usable
    .filter(i => i.key === key)
    .sort((a, b) => a.expires.localeCompare(b.expires))[0];

  const have = [], missing = [], extras = [];
  recipe.ingredients.forEach(k => { const it = pick(k); it ? have.push(it) : missing.push(k); });
  recipe.optional.forEach(k => { const it = pick(k); if (it) extras.push(it); });

  const used = [...have, ...extras];
  const score = used.reduce((sum, it) => sum + urgency(daysLeft(it, onDate)), 0) - missing.length * 4;
  return { recipe, have, missing, extras, used, score, complete: missing.length === 0 };
}

function chipsHtml(m, onDate) {
  const chip = it => {
    const urgentCls = daysLeft(it, onDate) <= 1 ? " urgent" : "";
    return `<span class="chip have${urgentCls}">✓ ${escapeHtml(it.name)}</span>`;
  };
  return `<div class="chips">
    ${m.have.map(chip).join("")}
    ${m.extras.map(chip).join("")}
    ${m.missing.map(k => `<span class="chip missing">need ${k}</span>`).join("")}
  </div>`;
}

// ---------- Cook today ----------

const suggestionsEl = document.getElementById("suggestions");
const onlyCompleteEl = document.getElementById("only-complete");
onlyCompleteEl.addEventListener("change", renderSuggestions);
let lastMatches = [];

function renderSuggestions() {
  const today = todayStr();
  lastMatches = RECIPES
    .map(r => matchRecipe(r, items, today))
    .filter(m => m.have.length > 0)                 // must use at least one main ingredient
    .filter(m => !onlyCompleteEl.checked || m.complete)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  if (!lastMatches.length) {
    suggestionsEl.innerHTML = `<li class="empty">No matching recipes yet. Add more ingredients.</li>`;
    return;
  }

  suggestionsEl.innerHTML = lastMatches.map((m, idx) => `
    <li class="recipe">
      <div class="recipe-head">
        <span class="recipe-name">${m.recipe.name}</span>
        <span class="meta">${m.recipe.minutes} min
          ${m.complete ? `<button class="small primary" data-cook="${idx}">Cook this</button>` : ""}</span>
      </div>
      ${chipsHtml(m, today)}
    </li>`).join("");
}

suggestionsEl.addEventListener("click", e => {
  const idx = e.target.dataset.cook;
  if (idx !== undefined) openCookDialog(lastMatches[idx]);
});

// ---------- "I cooked it" dialog ----------

const dialog = document.getElementById("cook-dialog");

function openCookDialog(match) {
  document.getElementById("cook-title").textContent = match.recipe.name;
  // Pre-check perishables; long-lasting bulk items (rice, pasta) usually aren't finished in one meal.
  document.getElementById("cook-items").innerHTML = match.used.map(it => `
    <li><label><input type="checkbox" value="${it.id}" ${daysLeft(it) <= BULK_DAYS ? "checked" : ""}>
      ${escapeHtml(it.name)} ${it.qty ? `(${escapeHtml(it.qty)})` : ""}</label></li>`).join("");
  dialog.showModal();
}

dialog.addEventListener("close", () => {
  if (dialog.returnValue !== "confirm") return;
  const usedUp = [...dialog.querySelectorAll("input:checked")].map(c => c.value);
  items = items.filter(i => !usedUp.includes(i.id));
  save();
});

// ---------- Meal plan ----------

const planDaysEl = document.getElementById("plan-days");
planDaysEl.addEventListener("change", renderPlan);

// Greedy planner: for each day, choose the complete recipe that rescues the most urgent
// ingredients, then remove those ingredients so they aren't promised to two meals.
function buildPlan(numDays) {
  let pool = [...items];
  const chosen = new Set();
  const plan = [];

  for (let d = 0; d < numDays; d++) {
    const date = addDays(todayStr(), d);
    const best = RECIPES
      .filter(r => !chosen.has(r.name))
      .map(r => matchRecipe(r, pool, date))
      .filter(m => m.complete)
      .sort((a, b) => b.score - a.score)[0];

    plan.push({ date, match: best || null });
    if (best) {
      chosen.add(best.recipe.name);
      const consumed = new Set(best.used.filter(it => daysLeft(it, date) <= BULK_DAYS).map(it => it.id));
      pool = pool.filter(i => !consumed.has(i.id));
    }
  }

  // Perishables that no planned meal uses and that expire during the plan.
  const endDate = addDays(todayStr(), numDays - 1);
  const atRisk = pool.filter(i => i.expires >= todayStr() && i.expires <= endDate);
  return { plan, atRisk };
}

function renderPlan() {
  const { plan, atRisk } = buildPlan(Number(planDaysEl.value));

  document.getElementById("plan-list").innerHTML = plan.map(({ date, match }, d) => `
    <li>
      <div class="day">${d === 0 ? "Today" : prettyDate(date)}</div>
      ${match
        ? `<div class="recipe-head"><span class="recipe-name">${match.recipe.name}</span>
             <span class="meta">${match.recipe.minutes} min</span></div>${chipsHtml(match, date)}`
        : `<div class="meta">Nothing complete left to cook. Time to shop (or eat out 🙂).</div>`}
    </li>`).join("");

  document.getElementById("plan-leftover").innerHTML = atRisk.length
    ? `<p class="tip">⚠️ No meal in this plan uses these before they expire: ${atRisk
        .map(i => `<b>${escapeHtml(i.name)}</b> (${prettyDate(i.expires)})`).join(", ")}.
        Freeze them, eat them as a snack, or add a recipe that uses them.</p>`
    : "";
}

// ---------- Tabs ----------

document.querySelectorAll(".tab").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll(".tab, .panel").forEach(el => el.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById(btn.dataset.tab).classList.add("active");
}));

// ---------- Backup ----------

document.getElementById("export-btn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `fridge-keeper-${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById("import-file").addEventListener("change", async e => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data)) throw new Error("not a list");
    items = data;
    save();
  } catch {
    alert("That file doesn't look like a Fridge Keeper backup.");
  }
  e.target.value = "";
});

// ---------- Boot ----------

function renderAll() {
  renderInventory();
  renderSuggestions();
  renderPlan();
}

resetForm();
renderAll();
