/* ── Auth ── */
const AUTH_KEY = "plan2d-auth";
const VALID_CREDENTIALS = [
  { email: "moderneisolation13@gmail.com", password: "jora2024" },
];

(function initAuth() {
  const gate = document.getElementById("authGate");
  const shell = document.querySelector(".app-shell");
  const form = document.getElementById("loginForm");
  const statusEl = document.getElementById("loginStatus");

  function unlock() {
    gate.classList.add("hidden");
    shell.classList.add("visible");
  }

  const saved = localStorage.getItem(AUTH_KEY);
  if (saved === "ok") { unlock(); }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const remember = document.getElementById("rememberSession").checked;
    const match = VALID_CREDENTIALS.find(c => c.email === email && c.password === password);
    if (match) {
      if (remember) localStorage.setItem(AUTH_KEY, "ok");
      unlock();
    } else {
      statusEl.textContent = "Email ou mot de passe incorrect.";
      statusEl.className = "status-note error";
    }
  });
})();

/* ── Constants ── */
const STORAGE_KEY = "plan2d-v2-state";
const OFFSET_COLOR = "#2d7a78";
const OPENING_COLOR = "#c45e2a";
const FONT = "Avenir Next, Segoe UI, system-ui, sans-serif";

/* ── State ── */
const initialState = () => ({
  clientName: "",
  projectName: "",
  projectAddress: "",
  roomName: "",
  projectDate: "",
  roomWidth: "",
  roomLength: "",
  ceilingHeight: "",
  wallThickness: "",
  projectNotes: "",
  videoDraft: null,
  noteMode: false,
  selectedPlanNoteId: null,
  selectedFurnishingId: null,
  planNotes: [],
  features: [],
  furnishings: [],
  calibration: {
    observed: "", actual: "", label: "",
    factor: null, appliedAt: null, backup: null,
    checkObserved: "", checkActual: "",
    checkDiscrepancy: null, checkStatus: null,
  },
  openings: [],
});

let state = loadState();
let dragState = null;
let latestPlanGeometry = null;

/* ── DOM refs ── */
const els = {
  clientName:               document.getElementById("clientName"),
  projectName:              document.getElementById("projectName"),
  projectAddress:           document.getElementById("projectAddress"),
  roomName:                 document.getElementById("roomName"),
  projectDate:              document.getElementById("projectDate"),
  roomWidth:                document.getElementById("roomWidth"),
  roomLength:               document.getElementById("roomLength"),
  ceilingHeight:            document.getElementById("ceilingHeight"),
  wallThickness:            document.getElementById("wallThickness"),
  projectNotes:             document.getElementById("projectNotes"),
  videoInput:               document.getElementById("videoInput"),
  videoStatus:              document.getElementById("videoStatus"),
  importVideoBtn:           document.getElementById("importVideoBtn"),
  clearVideoBtn:            document.getElementById("clearVideoBtn"),
  planNoteInput:            document.getElementById("planNoteInput"),
  addPlanNoteBtn:           document.getElementById("addPlanNoteBtn"),
  updatePlanNoteBtn:        document.getElementById("updatePlanNoteBtn"),
  deletePlanNoteBtn:        document.getElementById("deletePlanNoteBtn"),
  planNoteStatus:           document.getElementById("planNoteStatus"),
  calibrationObserved:      document.getElementById("calibrationObserved"),
  calibrationActual:        document.getElementById("calibrationActual"),
  calibrationLabel:         document.getElementById("calibrationLabel"),
  calibrationCheckObserved: document.getElementById("calibrationCheckObserved"),
  calibrationCheckActual:   document.getElementById("calibrationCheckActual"),
  calibrationStatus:        document.getElementById("calibrationStatus"),
  applyCalibrationBtn:      document.getElementById("applyCalibrationBtn"),
  clearCalibrationBtn:      document.getElementById("clearCalibrationBtn"),
  openingsList:             document.getElementById("openingsList"),
  featuresList:             document.getElementById("featuresList"),
  furnishingsList:          document.getElementById("furnishingsList"),
  planContainer:            document.getElementById("planContainer"),
  planSummary:              document.getElementById("planSummary"),
  openingTemplate:          document.getElementById("openingTemplate"),
  addOpeningBtn:            document.getElementById("addOpeningBtn"),
  addPillarBtn:             document.getElementById("addPillarBtn"),
  addLineBtn:               document.getElementById("addLineBtn"),
  addAlcoveBtn:             document.getElementById("addAlcoveBtn"),
  addCurveBtn:              document.getElementById("addCurveBtn"),
  addSofaBtn:               document.getElementById("addSofaBtn"),
  addTvBtn:                 document.getElementById("addTvBtn"),
  addBedBtn:                document.getElementById("addBedBtn"),
  addWardrobeBtn:           document.getElementById("addWardrobeBtn"),
  addFridgeBtn:             document.getElementById("addFridgeBtn"),
  addKitchenBtn:            document.getElementById("addKitchenBtn"),
  addIslandBtn:             document.getElementById("addIslandBtn"),
  demoBtn:                  document.getElementById("demoBtn"),
  resetBtn:                 document.getElementById("resetBtn"),
  exportSvgBtn:             document.getElementById("exportSvgBtn"),
  printBtn:                 document.getElementById("printBtn"),
  logoutBtn:                document.getElementById("logoutBtn"),
  videoScanMode:            document.getElementById("videoScanMode"),
  videoRoomPreset:          document.getElementById("videoRoomPreset"),
  videoInsights:            document.getElementById("videoInsights"),
};

/* ── Init ── */
bindTopLevelInputs();
bindActions();
renderAll();

/* ── Input binding ── */
function bindTopLevelInputs() {
  const fields = [
    "clientName","projectName","projectAddress","roomName","projectDate",
    "roomWidth","roomLength","ceilingHeight","wallThickness","projectNotes",
  ];
  fields.forEach((key) => {
    syncInputValue(els[key], state[key]);
    els[key].addEventListener("input", (e) => {
      state[key] = parseFieldValue(e.target);
      persistAndRender();
    });
  });

  const calibFields = [
    ["calibrationObserved",      (v) => { state.calibration.observed = v; }],
    ["calibrationActual",        (v) => { state.calibration.actual = v; }],
    ["calibrationLabel",         (v) => { state.calibration.label = v; }],
    ["calibrationCheckObserved", (v) => { state.calibration.checkObserved = v; }],
    ["calibrationCheckActual",   (v) => { state.calibration.checkActual = v; }],
  ];
  calibFields.forEach(([elKey, setter]) => {
    syncInputValue(els[elKey], elKey === "calibrationLabel" ? state.calibration.label
      : elKey === "calibrationObserved" ? state.calibration.observed
      : elKey === "calibrationActual" ? state.calibration.actual
      : elKey === "calibrationCheckObserved" ? state.calibration.checkObserved
      : state.calibration.checkActual);
    els[elKey].addEventListener("input", (e) => {
      setter(parseFieldValue(e.target));
      persistState();
      renderCalibrationStatus();
    });
  });
}

function bindActions() {
  els.addOpeningBtn.addEventListener("click", () => {
    state.openings.push({ id: makeId(), type: "door", wall: "bottom", offset: 0.5, width: 0.83, label: "" });
    persistAndRender();
  });

  els.addPillarBtn.addEventListener("click", () => {
    state.features.push({ id: makeId(), type: "pillar", label: "Poteau", x: 0.8, y: 0.8, width: 0.3, height: 0.3 });
    persistAndRender();
  });
  els.addLineBtn.addEventListener("click", () => {
    state.features.push({ id: makeId(), type: "line", label: "Ligne libre", x1: 1, y1: 1, x2: 2, y2: 1 });
    persistAndRender();
  });
  els.addAlcoveBtn.addEventListener("click", () => {
    state.features.push({ id: makeId(), type: "alcove", label: "Alcôve", wall: "right", offset: 1, width: 1, depth: 0.35, direction: "inward" });
    persistAndRender();
  });
  els.addCurveBtn.addEventListener("click", () => {
    state.features.push({ id: makeId(), type: "roundedWall", label: "Mur arrondi", wall: "top", start: 1, end: 2.2, depth: 0.35, direction: "inward" });
    persistAndRender();
  });

  els.addSofaBtn.addEventListener("click",    () => addFurniture("sofa"));
  els.addTvBtn.addEventListener("click",      () => addFurniture("tv"));
  els.addBedBtn.addEventListener("click",     () => addFurniture("bed"));
  els.addWardrobeBtn.addEventListener("click",() => addFurniture("wardrobe"));
  els.addFridgeBtn.addEventListener("click",  () => addFurniture("fridge"));
  els.addKitchenBtn.addEventListener("click", () => addFurniture("counter"));
  els.addIslandBtn.addEventListener("click",  () => addFurniture("island"));

  els.applyCalibrationBtn.addEventListener("click",  applyCalibration);
  els.clearCalibrationBtn.addEventListener("click",  clearCalibration);
  els.videoInput.addEventListener("change",          handleVideoSelection);
  els.importVideoBtn.addEventListener("click",       importVideoDraft);
  els.clearVideoBtn.addEventListener("click",        clearVideoDraft);
  els.addPlanNoteBtn.addEventListener("click",       togglePlanNoteMode);
  els.updatePlanNoteBtn.addEventListener("click",    updateSelectedPlanNote);
  els.deletePlanNoteBtn.addEventListener("click",    deleteSelectedPlanNote);
  els.exportSvgBtn.addEventListener("click",         exportSvg);
  els.printBtn.addEventListener("click",             printPlan);

  els.demoBtn.addEventListener("click", () => {
    state = {
      clientName: "Mme Martin",
      projectName: "Rénovation séjour",
      projectAddress: "18 avenue Victor Hugo, Paris 16e",
      roomName: "Séjour",
      projectDate: new Date().toISOString().slice(0, 10),
      roomWidth: 5.4,
      roomLength: 7.1,
      ceilingHeight: 2.7,
      wallThickness: 14,
      projectNotes: "Vérifier l'alignement de la cloison nord et la position des prises existantes.",
      videoDraft: { fileName: "releve-sejour.mp4", duration: 42, width: 1920, height: 1080, importedAt: new Date().toISOString(), estimated: true },
      calibration: { observed: 5.15, actual: 5.4, label: "Largeur du séjour", factor: null, appliedAt: null, backup: null, checkObserved: 6.9, checkActual: 7.1, checkDiscrepancy: null, checkStatus: null },
      openings: [
        { id: makeId(), type: "door",   wall: "left",   offset: 1.2, width: 0.9,  label: "Accès cuisine" },
        { id: makeId(), type: "window", wall: "top",    offset: 0.9, width: 1.8,  label: "Baie vitrée" },
        { id: makeId(), type: "window", wall: "right",  offset: 2.3, width: 1.1,  label: "Fenêtre latérale" },
        { id: makeId(), type: "arch",   wall: "bottom", offset: 2.0, width: 1.4,  label: "Arche couloir" },
      ],
      features: [
        { id: makeId(), type: "pillar",      label: "Poteau",          x: 1.1, y: 2.4, width: 0.35, height: 0.35 },
        { id: makeId(), type: "line",        label: "Retour cloison",  x1: 3.7, y1: 1.2, x2: 4.8, y2: 1.2 },
        { id: makeId(), type: "alcove",      label: "Alcôve TV",       wall: "right", offset: 2.2, width: 1.1, depth: 0.45, direction: "inward" },
        { id: makeId(), type: "roundedWall", label: "Mur arrondi",     wall: "top", start: 2, end: 3.4, depth: 0.4, direction: "inward" },
      ],
      furnishings: [
        createFurniture("sofa", 1.1, 4.2),
        createFurniture("tv",   2.1, 0.5),
        createFurniture("bed",  3.5, 3.8),
      ],
      noteMode: false,
      selectedPlanNoteId: null,
      selectedFurnishingId: null,
      planNotes: [{ id: makeId(), text: "Prise 220V existante", x: 520, y: 310 }],
    };
    syncInputsFromState();
    persistAndRender();
  });

  els.resetBtn.addEventListener("click", () => {
    state = initialState();
    dragState = null;
    latestPlanGeometry = null;
    els.videoInput.value = "";
    if (els.planNoteInput) els.planNoteInput.value = "";
    localStorage.removeItem(STORAGE_KEY);
    syncInputsFromState();
    renderAll();
  });

  if (els.logoutBtn) {
    els.logoutBtn.addEventListener("click", () => {
      localStorage.removeItem(AUTH_KEY);
      location.reload();
    });
  }
}

/* ── Sync helpers ── */
function syncInputsFromState() {
  ["clientName","projectName","projectAddress","roomName","projectDate",
   "roomWidth","roomLength","ceilingHeight","wallThickness","projectNotes"]
    .forEach((k) => syncInputValue(els[k], state[k]));
  syncInputValue(els.calibrationObserved,      state.calibration.observed);
  syncInputValue(els.calibrationActual,        state.calibration.actual);
  syncInputValue(els.calibrationLabel,         state.calibration.label);
  syncInputValue(els.calibrationCheckObserved, state.calibration.checkObserved);
  syncInputValue(els.calibrationCheckActual,   state.calibration.checkActual);
}
function syncInputValue(el, val) {
  if (el && "value" in el) el.value = val ?? "";
}

/* ── Render orchestration ── */
function renderAll() {
  renderVideoStatus();
  renderCalibrationStatus();
  renderPlanNoteStatus();
  renderOpenings();
  renderFeatures();
  renderFurnishings();
  renderPlan();
  renderSummary();
}

/* ── Video ── */
function renderVideoStatus() {
  if (!state.videoDraft) {
    els.videoStatus.textContent = "Aucune vidéo importée.";
    els.videoStatus.className = "status-text";
    els.importVideoBtn.disabled = true;
    return;
  }
  const dur = Number(state.videoDraft.duration || 0);
  els.videoStatus.textContent =
    `${state.videoDraft.fileName} • ${state.videoDraft.width}×${state.videoDraft.height} • ${dur.toFixed(1)} s` +
    (state.videoDraft.estimated ? " • brouillon généré" : "");
  els.videoStatus.className = "status-text active";
  els.importVideoBtn.disabled = false;
}

async function handleVideoSelection(e) {
  const file = e.target.files?.[0];
  if (!file) { state.videoDraft = null; persistAndRender(); return; }
  try {
    const meta = await readVideoMetadata(file);
    state.videoDraft = { fileName: file.name, duration: meta.duration, width: meta.width, height: meta.height, importedAt: new Date().toISOString(), estimated: false };
    persistAndRender();
  } catch {
    state.videoDraft = null;
    els.videoInput.value = "";
    els.videoStatus.textContent = "Lecture impossible. Essayez un autre fichier.";
    els.importVideoBtn.disabled = true;
  }
}
function importVideoDraft() {
  if (!state.videoDraft) return;
  clearCalibration(true);
  const est = estimateRoomFromVideo(state.videoDraft);
  Object.assign(state, { roomWidth: est.roomWidth, roomLength: est.roomLength, ceilingHeight: est.ceilingHeight, wallThickness: est.wallThickness, openings: est.openings });
  state.projectNotes = [state.projectNotes, est.note].filter(Boolean).join(" ").trim();
  state.videoDraft.estimated = true;
  syncInputsFromState();
  persistAndRender();
}
function clearVideoDraft() {
  state.videoDraft = null;
  els.videoInput.value = "";
  persistAndRender();
}
function estimateRoomFromVideo(v) {
  const dur = clamp(Number(v.duration) || 20, 6, 240);
  const land = Number(v.width) >= Number(v.height);
  const w = roundTo2((land ? 4.3 : 3.6) + dur / 90);
  const l = roundTo2(w + 1 + dur / 70);
  const openings = [
    { id: makeId(), type: "door",   wall: "bottom", offset: roundTo2(Math.max(0.3, w * 0.14)), width: 0.9,  label: "Porte suggérée" },
    { id: makeId(), type: "window", wall: "top",    offset: roundTo2(Math.max(0.5, w * 0.2)),  width: roundTo2(Math.min(1.8, w * 0.32)), label: "Fenêtre suggérée" },
  ];
  if (dur > 35) openings.push({ id: makeId(), type: "window", wall: "right", offset: roundTo2(Math.max(0.8, l * 0.28)), width: 1.1, label: "Ouverture suggérée" });
  return { roomWidth: w, roomLength: l, ceilingHeight: roundTo2(land ? 2.6 : 2.5), wallThickness: 12, openings, note: "[Brouillon vidéo — calibrer avec une cote réelle.]" };
}
function readVideoMetadata(file) {
  return new Promise((res, rej) => {
    const v = document.createElement("video");
    const url = URL.createObjectURL(file);
    v.preload = "metadata"; v.src = url;
    v.onloadedmetadata = () => { res({ duration: v.duration, width: v.videoWidth, height: v.videoHeight }); URL.revokeObjectURL(url); };
    v.onerror = () => { URL.revokeObjectURL(url); rej(new Error("Impossible de lire la vidéo.")); };
  });
}

/* ── Calibration ── */
function applyCalibration() {
  const obs = normalizePositiveNumber(state.calibration.observed);
  const act = normalizePositiveNumber(state.calibration.actual);
  if (!obs || !act) {
    setCalibStatus("Entrez une cote observée et réelle valides.", "");
    return;
  }
  const factor = act / obs;
  const baseline = state.calibration.backup || snapshotCalibratableState();
  state.calibration.backup = baseline;
  applyCalibrationFromBaseline(baseline, factor);
  state.calibration.factor = factor;
  state.calibration.appliedAt = new Date().toISOString();

  const chkObs = normalizePositiveNumber(state.calibration.checkObserved);
  const chkAct = normalizePositiveNumber(state.calibration.checkActual);
  if (chkObs && chkAct) {
    const chkFactor = chkAct / chkObs;
    const pct = Math.abs(chkFactor - factor) / factor * 100;
    state.calibration.checkDiscrepancy = roundTo2(pct);
    state.calibration.checkStatus = pct < 1 ? "ok" : pct < 2 ? "warning" : "error";
  } else {
    state.calibration.checkDiscrepancy = null;
    state.calibration.checkStatus = null;
  }
  syncInputsFromState();
  persistAndRender();
}
function clearCalibration(skipRender = false) {
  if (state.calibration.backup) restoreCalibratableState(state.calibration.backup);
  state.calibration.factor = null;
  state.calibration.appliedAt = null;
  state.calibration.backup = null;
  state.calibration.checkDiscrepancy = null;
  state.calibration.checkStatus = null;
  if (!skipRender) { syncInputsFromState(); persistAndRender(); }
}
function renderCalibrationStatus() {
  const c = state.calibration;
  if (!c.factor) { setCalibStatus("Aucune calibration appliquée.", ""); return; }
  const lbl = c.label ? `${c.label} — ` : "";
  let txt = `${lbl}×${c.factor.toFixed(4)} • ${formatDateTime(c.appliedAt)}`;
  let cls = "active";
  if (c.checkDiscrepancy !== null) {
    const pct = c.checkDiscrepancy.toFixed(1);
    const icon = c.checkStatus === "ok" ? "✓" : c.checkStatus === "warning" ? "⚠" : "✕";
    txt += ` | Vérif. 2 : ${icon} ${pct}%`;
    cls = c.checkStatus === "ok" ? "success" : c.checkStatus === "warning" ? "warning" : "error";
  }
  setCalibStatus(txt, cls);
}
function setCalibStatus(txt, cls) {
  els.calibrationStatus.textContent = txt;
  els.calibrationStatus.className = `status-text ${cls}`.trim();
}
function renderCalibrationLabel() {
  if (!state.calibration.factor) return "Non appliquée";
  return `${state.calibration.label || "Cote réf."} ×${state.calibration.factor.toFixed(3)}`;
}
function snapshotCalibratableState() {
  return { roomWidth: state.roomWidth, roomLength: state.roomLength, ceilingHeight: state.ceilingHeight, wallThickness: state.wallThickness, openings: deepCopy(state.openings), features: deepCopy(state.features), furnishings: deepCopy(state.furnishings) };
}
function restoreCalibratableState(snap) {
  state.roomWidth = snap.roomWidth; state.roomLength = snap.roomLength;
  state.ceilingHeight = snap.ceilingHeight; state.wallThickness = snap.wallThickness;
  state.openings = deepCopy(snap.openings); state.features = deepCopy(snap.features || []);
  state.furnishings = deepCopy(snap.furnishings || []);
}
function applyCalibrationFromBaseline(snap, f) {
  state.roomWidth    = roundTo2(normalizeDimension(snap.roomWidth,    1) * f);
  state.roomLength   = roundTo2(normalizeDimension(snap.roomLength,   1) * f);
  state.ceilingHeight= roundTo2(normalizeDimension(snap.ceilingHeight,1) * f);
  state.wallThickness= Math.round(normalizeDimension(snap.wallThickness,1) * f);
  state.openings = snap.openings.map((o) => ({ ...o, offset: roundTo2(normalizeDimension(o.offset,0)*f), width: roundTo2(normalizeDimension(o.width,0.2)*f) }));
  state.features = (snap.features||[]).map((ft) => {
    if (ft.type==="pillar") return { ...ft, x:roundTo2(normalizeDimension(ft.x,0)*f), y:roundTo2(normalizeDimension(ft.y,0)*f), width:roundTo2(normalizeDimension(ft.width,0.2)*f), height:roundTo2(normalizeDimension(ft.height,0.2)*f) };
    if (ft.type==="line")   return { ...ft, x1:roundTo2(normalizeDimension(ft.x1,0)*f), y1:roundTo2(normalizeDimension(ft.y1,0)*f), x2:roundTo2(normalizeDimension(ft.x2,0)*f), y2:roundTo2(normalizeDimension(ft.y2,0)*f) };
    if (ft.type==="alcove") return { ...ft, offset:roundTo2(normalizeDimension(ft.offset,0)*f), width:roundTo2(normalizeDimension(ft.width,0.2)*f), depth:roundTo2(normalizeDimension(ft.depth,0.1)*f) };
    if (ft.type==="roundedWall") return { ...ft, start:roundTo2(normalizeDimension(ft.start,0)*f), end:roundTo2(normalizeDimension(ft.end,0.2)*f), depth:roundTo2(normalizeDimension(ft.depth,0.1)*f) };
    return ft;
  });
  state.furnishings = (snap.furnishings||[]).map((it) => ({ ...it, x:roundTo2(normalizeDimension(it.x,0)*f), y:roundTo2(normalizeDimension(it.y,0)*f), width:roundTo2(normalizeDimension(it.width,0.3)*f), height:roundTo2(normalizeDimension(it.height,0.2)*f) }));
}

/* ── Plan notes ── */
function renderPlanNoteStatus() {
  if (state.noteMode) {
    els.planNoteStatus.textContent = "Mode note actif — cliquez sur le plan pour placer.";
    els.planNoteStatus.className = "status-text active";
    els.addPlanNoteBtn.textContent = "Annuler la note";
    document.body.classList.add("note-mode");
    syncPlanNoteButtons(); return;
  }
  const sel = getSelectedPlanNote();
  els.planNoteStatus.textContent = sel ? "Note sélectionnée — vous pouvez la modifier." : "Activez le mode note puis cliquez sur le plan.";
  els.planNoteStatus.className = "status-text";
  els.addPlanNoteBtn.textContent = "Ajouter note";
  document.body.classList.remove("note-mode");
  if (sel) els.planNoteInput.value = sel.text;
  syncPlanNoteButtons();
}
function syncPlanNoteButtons() {
  const has = Boolean(getSelectedPlanNote());
  els.updatePlanNoteBtn.disabled = !has;
  els.deletePlanNoteBtn.disabled = !has;
}
function togglePlanNoteMode() {
  const txt = els.planNoteInput.value.trim();
  if (!state.noteMode && !txt) { els.planNoteStatus.textContent = "Écrivez d'abord le texte de la note."; return; }
  state.noteMode = !state.noteMode;
  persistAndRender();
}
function placePlanNote(e, svg) {
  const txt = els.planNoteInput.value.trim();
  if (!txt) { state.noteMode = false; persistAndRender(); return; }
  const pt = getSvgPoint(svg, e);
  state.planNotes.push({ id: makeId(), text: txt, x: roundTo2(pt.x), y: roundTo2(pt.y) });
  state.selectedPlanNoteId = state.planNotes[state.planNotes.length-1].id;
  els.planNoteInput.value = "";
  state.noteMode = false;
  persistAndRender();
}
function updateSelectedPlanNote() {
  const note = getSelectedPlanNote();
  const txt = els.planNoteInput.value.trim();
  if (!note || !txt) return;
  note.text = txt; persistAndRender();
}
function deleteSelectedPlanNote() {
  const note = getSelectedPlanNote();
  if (!note) return;
  state.planNotes = state.planNotes.filter((n) => n.id !== note.id);
  state.selectedPlanNoteId = null;
  els.planNoteInput.value = "";
  persistAndRender();
}
function getSelectedPlanNote() {
  return state.planNotes.find((n) => n.id === state.selectedPlanNoteId) || null;
}

/* ── Sidebar lists ── */
function renderOpenings() {
  els.openingsList.innerHTML = "";
  if (!state.openings.length) { els.openingsList.innerHTML = `<p class="empty-openings">Aucune ouverture.</p>`; return; }
  state.openings.forEach((op) => {
    const frag = els.openingTemplate.content.cloneNode(true);
    const item = frag.querySelector(".opening-item");
    item.dataset.id = op.id;
    item.querySelectorAll("[data-field]").forEach((field) => {
      const key = field.dataset.field;
      field.value = op[key];
      field.addEventListener("input", (e) => {
        const target = state.openings.find((o) => o.id === op.id);
        target[key] = e.target.type === "number" ? parseNumberish(e.target.value) : e.target.value;
        persistState(); renderPlan(); renderSummary();
      });
    });
    item.querySelector('[data-action="delete"]').addEventListener("click", () => {
      state.openings = state.openings.filter((o) => o.id !== op.id);
      persistAndRender();
    });
    els.openingsList.appendChild(frag);
  });
}

function renderFeatures() {
  els.featuresList.innerHTML = "";
  if (!state.features.length) { els.featuresList.innerHTML = `<p class="empty-openings">Aucune particularité.</p>`; return; }
  state.features.forEach((ft) => {
    const art = document.createElement("article");
    art.className = "feature-item";
    const titles = { pillar: "Poteau / gaine", alcove: "Alcôve", roundedWall: "Mur arrondi", line: "Ligne libre" };
    art.innerHTML = `
      <div class="feature-head">
        <span class="feature-badge">${titles[ft.type] || ft.type}</span>
        <button class="delete-btn" type="button">Supprimer</button>
      </div>
      <div class="opening-grid">${renderFeatureFields(ft)}</div>`;
    art.querySelectorAll("[data-feature-field]").forEach((field) => {
      const key = field.dataset.featureField;
      field.value = ft[key] ?? "";
      field.addEventListener("input", (e) => {
        const target = state.features.find((f) => f.id === ft.id);
        target[key] = e.target.type === "number" ? parseNumberish(e.target.value) : e.target.value;
        persistState(); renderPlan(); renderSummary();
      });
    });
    art.querySelector(".delete-btn").addEventListener("click", () => {
      state.features = state.features.filter((f) => f.id !== ft.id);
      persistAndRender();
    });
    els.featuresList.appendChild(art);
  });
}

function renderFeatureFields(ft) {
  if (ft.type === "pillar") return `
    <label class="full"><span>Libellé</span><input data-feature-field="label" type="text" /></label>
    <label><span>X (m)</span><input data-feature-field="x" type="number" step="0.01" /></label>
    <label><span>Y (m)</span><input data-feature-field="y" type="number" step="0.01" /></label>
    <label><span>Largeur (m)</span><input data-feature-field="width" type="number" step="0.01" /></label>
    <label><span>Profondeur (m)</span><input data-feature-field="height" type="number" step="0.01" /></label>`;
  if (ft.type === "alcove") return `
    <label class="full"><span>Libellé</span><input data-feature-field="label" type="text" /></label>
    <label><span>Mur</span><select data-feature-field="wall"><option value="top">Haut</option><option value="right">Droite</option><option value="bottom">Bas</option><option value="left">Gauche</option></select></label>
    <label><span>Type</span><select data-feature-field="direction"><option value="inward">Entrante</option><option value="outward">Sortante</option></select></label>
    <label><span>Distance début (m)</span><input data-feature-field="offset" type="number" step="0.01" /></label>
    <label><span>Largeur (m)</span><input data-feature-field="width" type="number" step="0.01" /></label>
    <label><span>Profondeur (m)</span><input data-feature-field="depth" type="number" step="0.01" /></label>`;
  if (ft.type === "roundedWall") return `
    <label class="full"><span>Libellé</span><input data-feature-field="label" type="text" /></label>
    <label><span>Mur</span><select data-feature-field="wall"><option value="top">Haut</option><option value="right">Droite</option><option value="bottom">Bas</option><option value="left">Gauche</option></select></label>
    <label><span>Type</span><select data-feature-field="direction"><option value="inward">Entrant</option><option value="outward">Sortant</option></select></label>
    <label><span>Repère 1 (m)</span><input data-feature-field="start" type="number" step="0.01" /></label>
    <label><span>Repère 2 (m)</span><input data-feature-field="end" type="number" step="0.01" /></label>
    <label><span>Profondeur (m)</span><input data-feature-field="depth" type="number" step="0.01" /></label>`;
  return `
    <label class="full"><span>Libellé</span><input data-feature-field="label" type="text" /></label>
    <label><span>X1 (m)</span><input data-feature-field="x1" type="number" step="0.01" /></label>
    <label><span>Y1 (m)</span><input data-feature-field="y1" type="number" step="0.01" /></label>
    <label><span>X2 (m)</span><input data-feature-field="x2" type="number" step="0.01" /></label>
    <label><span>Y2 (m)</span><input data-feature-field="y2" type="number" step="0.01" /></label>`;
}

function renderFurnishings() {
  els.furnishingsList.innerHTML = "";
  if (!state.furnishings?.length) { els.furnishingsList.innerHTML = `<p class="empty-openings">Aucun mobilier.</p>`; return; }
  state.furnishings.forEach((item) => {
    const art = document.createElement("article");
    art.className = "feature-item";
    art.innerHTML = `
      <div class="feature-head">
        <span class="feature-badge">${safe(item.label)}</span>
        <button class="delete-btn" type="button">Supprimer</button>
      </div>
      <div class="opening-grid">
        <label><span>X (m)</span><input data-furnishing-field="x" type="number" step="0.01" /></label>
        <label><span>Y (m)</span><input data-furnishing-field="y" type="number" step="0.01" /></label>
        <label><span>Largeur (m)</span><input data-furnishing-field="width" type="number" step="0.01" /></label>
        <label><span>Profondeur (m)</span><input data-furnishing-field="height" type="number" step="0.01" /></label>
      </div>`;
    art.querySelectorAll("[data-furnishing-field]").forEach((field) => {
      const key = field.dataset.furnishingField;
      field.value = item[key] ?? "";
      field.addEventListener("input", (e) => {
        const target = state.furnishings.find((f) => f.id === item.id);
        target[key] = parseNumberish(e.target.value);
        persistState(); renderPlan();
      });
    });
    art.querySelector(".delete-btn").addEventListener("click", () => {
      state.furnishings = state.furnishings.filter((f) => f.id !== item.id);
      if (state.selectedFurnishingId === item.id) state.selectedFurnishingId = null;
      persistAndRender();
    });
    els.furnishingsList.appendChild(art);
  });
}

/* ── Summary ── */
function renderSummary() {
  const w = normalizePositiveNumber(state.roomWidth);
  const l = normalizePositiveNumber(state.roomLength);
  const video = state.videoDraft ? " • vidéo chargée" : "";
  const calib = state.calibration.factor ? ` • ×${state.calibration.factor.toFixed(3)}` : "";
  if (!w || !l) {
    els.planSummary.innerHTML = `<strong>${safe(state.roomName || "Plan vierge")}</strong> — saisir largeur et longueur${video}`;
    return;
  }
  const nOp = state.openings.length;
  const nFt = state.features.length;
  els.planSummary.innerHTML =
    `<strong>${safe(state.roomName || "Pièce")}</strong> — ` +
    `${formatMeters(w)} × ${formatMeters(l)} m` +
    ` • ${nOp} ouverture${nOp!==1?"s":""} • ${nFt} particularité${nFt!==1?"s":""}` +
    `${video}${calib}`;
}

/* ══════════════════════════════════════════
   PLAN SVG
══════════════════════════════════════════ */
function renderPlan() {
  const rawW = normalizePositiveNumber(state.roomWidth);
  const rawL = normalizePositiveNumber(state.roomLength);
  if (!rawW || !rawL) {
    latestPlanGeometry = null;
    els.planContainer.innerHTML = `
      <svg class="plan-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1180 900">
        <rect width="1180" height="900" fill="#fffdf8"/>
        <text x="70" y="52" fill="#b8642d" font-size="13" font-family="${FONT}" letter-spacing="2">PLAN 2D INTERNE</text>
        <text x="70" y="82" fill="#1f2a2c" font-size="28" font-family="Georgia,serif">${escapeXml(state.projectName||"Plan de pièce")}</text>
        <rect x="130" y="160" width="920" height="560" rx="30" fill="rgba(33,79,75,0.04)" stroke="rgba(33,79,75,0.12)" stroke-dasharray="8 10"/>
        <text x="590" y="450" fill="#657172" font-size="20" text-anchor="middle" font-family="${FONT}">Renseignez largeur et longueur pour générer le plan</text>
      </svg>`;
    return;
  }

  const width  = rawW;
  const length = rawL;
  const wallCm = normalizeDimension(state.wallThickness, 12);
  const openings   = normalizeOpenings(state.openings, width, length);
  const features   = normalizeFeatures(Array.isArray(state.features) ? state.features : [], width, length);
  const alcoves     = features.filter((f) => f.type === "alcove");
  const roundedWalls= features.filter((f) => f.type === "roundedWall");

  const svgW = 1180, svgH = 900;
  const margin = 160, cartH = 220;
  const drawW = svgW - margin*2, drawH = svgH - margin*2 - cartH;
  const scale = Math.min(drawW/width, drawH/length);
  const planW = width*scale, planH = length*scale;
  const x = (svgW - planW)/2, y = 100;

  const wallStroke = Math.max(6, (wallCm/2)*0.7);
  latestPlanGeometry = { x, y, planWidth:planW, planHeight:planH, scale, width, length, svgWidth:svgW, svgHeight:svgH };

  const geom = latestPlanGeometry;
  const safe_call = (fn, fallback="") => { try { return fn(); } catch { return fallback; } };

  const outlineSvg       = safe_call(() => renderRoomOutline({ x,y,width,length,scale,wallStroke,alcoves,roundedWalls }), `<rect x="${x}" y="${y}" width="${planW}" height="${planH}" fill="#f8f4ea" stroke="#214f4b" stroke-width="${wallStroke}"/>`);
  const featuresSvg      = safe_call(() => renderFeaturesSvg(features, { x,y,scale,width,length }));
  const openingsSvg      = safe_call(() => renderOpeningsSvg(openings, { x,y,planWidth:planW,planHeight:planH,scale,wallStroke }));
  const furnishingsSvg   = safe_call(() => renderFurnishingsSvg(normalizeFurnishings(state.furnishings||[], width, length), { x,y,scale }));
  const openingMeasSvg   = safe_call(() => renderOpeningMeasurements(openings, geom));
  const notesSvg         = safe_call(() => renderPlanNotes());
  const dimLinesSvg      = safe_call(() => renderDimensionLines({ x,y,planWidth:planW,planHeight:planH,width,length }));
  const scaleBarSvg      = safe_call(() => renderScaleBar({ x,y,planWidth:planW,planHeight:planH,scale }));
  const wallLabelsSvg    = safe_call(() => renderWallLabels({ x,y,planWidth:planW,planHeight:planH }));
  const segmentLabelsSvg = safe_call(() => renderOutlineSegmentLabels({ x,y,width,length,scale,alcoves,roundedWalls }));
  const cartoucheSvg     = safe_call(() => renderCartoucheNotes(svgH));

  els.planContainer.innerHTML = `
    <svg class="plan-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}">
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#657172"/></marker>
        <marker id="arrOff" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${OFFSET_COLOR}"/></marker>
        <marker id="arrOp" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${OPENING_COLOR}"/></marker>
      </defs>
      <rect width="${svgW}" height="${svgH}" fill="#fffdf8"/>
      <text x="70" y="50" fill="#b8642d" font-size="12" font-family="${FONT}" letter-spacing="2">PLAN 2D INTERNE</text>
      <text x="70" y="78" fill="#1f2a2c" font-size="26" font-family="Georgia,serif">${escapeXml(state.projectName||"Plan de pièce")}</text>

      ${outlineSvg}
      ${featuresSvg}
      ${furnishingsSvg}
      ${openingsSvg}
      ${openingMeasSvg}
      ${notesSvg}
      ${dimLinesSvg}
      ${scaleBarSvg}
      ${wallLabelsSvg}
      ${segmentLabelsSvg}

      <!-- Cartouche -->
      <rect x="60" y="${svgH-cartH-24}" width="${svgW-120}" height="${cartH}" rx="18" fill="#f5f1e7" stroke="#d8cfbb"/>
      <text x="86" y="${svgH-cartH+4}"  fill="#657172" font-size="11" font-family="${FONT}">Client</text>
      <text x="86" y="${svgH-cartH+26}" fill="#1f2a2c" font-size="16" font-family="${FONT}">${escapeXml(state.clientName||"—")}</text>
      <text x="300" y="${svgH-cartH+4}"  fill="#657172" font-size="11" font-family="${FONT}">Pièce</text>
      <text x="300" y="${svgH-cartH+26}" fill="#1f2a2c" font-size="16" font-family="${FONT}">${escapeXml(state.roomName||"—")}</text>
      <text x="480" y="${svgH-cartH+4}"  fill="#657172" font-size="11" font-family="${FONT}">Date</text>
      <text x="480" y="${svgH-cartH+26}" fill="#1f2a2c" font-size="16" font-family="${FONT}">${escapeXml(state.projectDate||"—")}</text>
      <text x="640" y="${svgH-cartH+4}"  fill="#657172" font-size="11" font-family="${FONT}">Dimensions</text>
      <text x="640" y="${svgH-cartH+26}" fill="#1f2a2c" font-size="16" font-family="${FONT}">${formatMeters(width)} × ${formatMeters(length)} m</text>
      <text x="870" y="${svgH-cartH+4}"  fill="#657172" font-size="11" font-family="${FONT}">Calibration</text>
      <text x="870" y="${svgH-cartH+26}" fill="#1f2a2c" font-size="14" font-family="${FONT}">${escapeXml(renderCalibrationLabel())}</text>
      <text x="86"  y="${svgH-cartH+68}" fill="#657172" font-size="11" font-family="${FONT}">Adresse</text>
      <text x="86"  y="${svgH-cartH+90}" fill="#1f2a2c" font-size="14" font-family="${FONT}">${escapeXml(state.projectAddress||"—")}</text>
      <text x="86"  y="${svgH-cartH+130}" fill="#657172" font-size="11" font-family="${FONT}">Notes</text>
      ${cartoucheSvg}
    </svg>`;
  bindPlanInteractions();
}

/* ── Room outline ── */
function renderRoomOutline({ x,y,width,length,scale,wallStroke,alcoves,roundedWalls }) {
  const path = buildRoomOutlinePath({ x,y,width,length,scale,alcoves,roundedWalls });
  return `<path d="${path}" fill="#f8f4ea" stroke="#214f4b" stroke-width="${wallStroke}" stroke-linejoin="miter"/>`;
}
function buildRoomOutlinePath(opts) {
  const cmds = buildRoomOutlineCommands(opts);
  if (!cmds.length) { const {x,y,width,length,scale}=opts; return `M${x} ${y}L${x+width*scale} ${y}L${x+width*scale} ${y+length*scale}L${x} ${y+length*scale}Z`; }
  return `M${cmds[0].x1} ${cmds[0].y1} ` + cmds.map((c) => c.kind==="curve" ? `Q${c.cx} ${c.cy} ${c.x2} ${c.y2}` : `L${c.x2} ${c.y2}`).join(" ") + " Z";
}
function buildRoomOutlineCommands({ x,y,width,length,scale,alcoves,roundedWalls }) {
  const byWall = (wall) => alcoves.filter((a)=>a.wall===wall);
  const byCurve = (wall) => roundedWalls.filter((r)=>r.wall===wall);
  const cmds=[];
  const pushLine=(x1,y1,x2,y2)=>{if(Math.abs(x2-x1)<0.01&&Math.abs(y2-y1)<0.01)return;cmds.push({kind:"line",x1,y1,x2,y2});};
  const pushCurve=(x1,y1,cx,cy,x2,y2,meters)=>cmds.push({kind:"curve",x1,y1,cx,cy,x2,y2,meters});
  let cx=x,cy=y;

  // Top wall
  const topEvts=mergeWallEvents(byWall("top"),byCurve("top"),"top"); let curX=0;
  topEvts.forEach((ev)=>{const st=ev.type==="curve"?ev.start:ev.offset,en=ev.type==="curve"?ev.end:ev.offset+ev.width;if(st>curX){pushLine(cx,cy,x+st*scale,y);cx=x+st*scale;cy=y;}if(ev.type==="curve"){const c=computeRoundedWallShape(ev,scale,x,y,width,length);pushCurve(cx,cy,c.controlX,c.controlY,c.endX,c.endY,Math.abs(ev.end-ev.start));cx=c.endX;cy=c.endY;}else{const d=ev.direction==="outward"?-ev.depth:ev.depth;pushLine(cx,cy,x+ev.offset*scale,y+d*scale);cx=x+ev.offset*scale;cy=y+d*scale;pushLine(cx,cy,x+(ev.offset+ev.width)*scale,y+d*scale);cx=x+(ev.offset+ev.width)*scale;cy=y+d*scale;pushLine(cx,cy,cx,y);cy=y;}curX=en;});
  if(curX<width){pushLine(cx,cy,x+width*scale,y);cx=x+width*scale;cy=y;}

  // Right wall
  const rightEvts=mergeWallEvents(byWall("right"),byCurve("right"),"right"); let curY=0;
  rightEvts.forEach((ev)=>{const st=ev.type==="curve"?ev.start:ev.offset,en=ev.type==="curve"?ev.end:ev.offset+ev.width;if(st>curY){pushLine(cx,cy,x+width*scale,y+st*scale);cx=x+width*scale;cy=y+st*scale;}if(ev.type==="curve"){const c=computeRoundedWallShape(ev,scale,x,y,width,length);pushCurve(cx,cy,c.controlX,c.controlY,c.endX,c.endY,Math.abs(ev.end-ev.start));cx=c.endX;cy=c.endY;}else{const d=ev.direction==="outward"?ev.depth:-ev.depth;pushLine(cx,cy,x+width*scale+d*scale,y+ev.offset*scale);cx=x+width*scale+d*scale;cy=y+ev.offset*scale;pushLine(cx,cy,cx,y+(ev.offset+ev.width)*scale);cy=y+(ev.offset+ev.width)*scale;pushLine(cx,cy,x+width*scale,cy);cx=x+width*scale;}curY=en;});
  if(curY<length){pushLine(cx,cy,x+width*scale,y+length*scale);cx=x+width*scale;cy=y+length*scale;}

  // Bottom wall
  const botEvts=mergeWallEvents(byWall("bottom"),byCurve("bottom"),"bottom"); curX=width;
  botEvts.forEach((ev)=>{const st=ev.type==="curve"?ev.start:ev.offset,en=ev.type==="curve"?ev.end:ev.offset+ev.width;if(curX>en){pushLine(cx,cy,x+en*scale,y+length*scale);cx=x+en*scale;cy=y+length*scale;}if(ev.type==="curve"){const c=computeRoundedWallShape(ev,scale,x,y,width,length);pushCurve(cx,cy,c.controlX,c.controlY,c.endX,c.endY,Math.abs(ev.end-ev.start));cx=c.endX;cy=c.endY;}else{const d=ev.direction==="outward"?ev.depth:-ev.depth;pushLine(cx,cy,x+en*scale,y+length*scale+d*scale);cx=x+en*scale;cy=y+length*scale+d*scale;pushLine(cx,cy,x+ev.offset*scale,cy);cx=x+ev.offset*scale;pushLine(cx,cy,cx,y+length*scale);cy=y+length*scale;}curX=st;});
  if(curX>0){pushLine(cx,cy,x,y+length*scale);cx=x;cy=y+length*scale;}

  // Left wall
  const leftEvts=mergeWallEvents(byWall("left"),byCurve("left"),"left"); curY=length;
  leftEvts.forEach((ev)=>{const st=ev.type==="curve"?ev.start:ev.offset,en=ev.type==="curve"?ev.end:ev.offset+ev.width;if(curY>en){pushLine(cx,cy,x,y+en*scale);cx=x;cy=y+en*scale;}if(ev.type==="curve"){const c=computeRoundedWallShape(ev,scale,x,y,width,length);pushCurve(cx,cy,c.controlX,c.controlY,c.endX,c.endY,Math.abs(ev.end-ev.start));cx=c.endX;cy=c.endY;}else{const d=ev.direction==="outward"?-ev.depth:ev.depth;pushLine(cx,cy,x+d*scale,y+en*scale);cx=x+d*scale;cy=y+en*scale;pushLine(cx,cy,cx,y+ev.offset*scale);cy=y+ev.offset*scale;pushLine(cx,cy,x,cy);cx=x;}curY=st;});
  if(curY>0)pushLine(cx,cy,x,y);
  return cmds;
}
function mergeWallEvents(alcoves, curves, wall) {
  return [...alcoves.map((a)=>({...a,type:"alcove"})),...curves.map((c)=>({...c,type:"curve"}))]
    .sort((a,b)=>{const as=a.type==="curve"?a.start:a.offset,bs=b.type==="curve"?b.start:b.offset;return (wall==="bottom"||wall==="left")?bs-as:as-bs;});
}

/* ── Openings SVG ── */
function renderOpeningsSvg(openings, { x,y,planWidth,planHeight,scale,wallStroke }) {
  return openings.map((op) => {
    const isDoor   = op.type === "door";
    const isWindow = op.type === "window";
    const isArch   = op.type === "arch";
    const color = isDoor ? "#b8642d" : isArch ? "#4a7a9b" : "#2a6f97";
    const thickness = isDoor ? 8 : isArch ? 6 : 5;
    const geom = computeOpeningGeometry(op, { x,y,planWidth,planHeight,scale });
    const label = escapeXml(op.label || (isDoor ? "Porte" : isArch ? "Arche" : "Fenêtre"));
    const swingArc = isDoor ? renderDoorSwingArc(op, geom, color) : "";
    const archArc  = isArch ? renderArchArc(op, geom, color) : "";
    const windowGrill = isWindow ? renderWindowGrill(geom, color) : "";

    return `
      <g class="opening-group" data-opening-id="${op.id}">
        <line class="opening-hit" x1="${geom.startX}" y1="${geom.startY}" x2="${geom.endX}" y2="${geom.endY}" stroke="transparent" stroke-width="${wallStroke+22}"/>
        <line x1="${geom.startX}" y1="${geom.startY}" x2="${geom.endX}" y2="${geom.endY}" stroke="#fffdf8" stroke-width="${wallStroke+6}"/>
        ${swingArc}${archArc}${windowGrill}
        <line x1="${geom.startX}" y1="${geom.startY}" x2="${geom.endX}" y2="${geom.endY}" stroke="${color}" stroke-width="${thickness}" stroke-linecap="round"/>
        <circle class="opening-handle" cx="${geom.centerX}" cy="${geom.centerY}" r="11" fill="${color}" stroke="#fffdf8" stroke-width="2.5"/>
        <text x="${geom.labelX}" y="${geom.labelY}" fill="${color}" font-size="12" text-anchor="middle" font-family="${FONT}">${label}</text>
      </g>`;
  }).join("");
}

function renderDoorSwingArc(op, geom, color) {
  const r = normalizeDimension(op.width, 0.9) * (latestPlanGeometry?.scale || 80);
  const { startX, startY } = geom;
  let path = "";
  if (op.wall === "bottom") {
    path = `M${startX},${startY} L${startX},${startY-r} A${r},${r} 0 0,0 ${startX+r},${startY} Z`;
  } else if (op.wall === "top") {
    path = `M${startX},${startY} L${startX},${startY+r} A${r},${r} 0 0,1 ${startX+r},${startY} Z`;
  } else if (op.wall === "left") {
    path = `M${startX},${startY} L${startX+r},${startY} A${r},${r} 0 0,0 ${startX},${startY+r} Z`;
  } else {
    path = `M${startX},${startY} L${startX-r},${startY} A${r},${r} 0 0,1 ${startX},${startY+r} Z`;
  }
  return `<path d="${path}" fill="${color}" fill-opacity="0.08" stroke="${color}" stroke-width="1.2" stroke-dasharray="5 3"/>`;
}

function renderArchArc(op, geom, color) {
  const { startX, startY, endX, endY } = geom;
  const midX = (startX+endX)/2, midY = (startY+endY)/2;
  const r = normalizeDimension(op.width, 1) * (latestPlanGeometry?.scale || 80) * 0.6;
  let cx = midX, cy = midY;
  if (op.wall==="top"||op.wall==="bottom") cy = startY + (op.wall==="bottom"?-r:r)*0.5;
  else cx = startX + (op.wall==="right"?-r:r)*0.5;
  return `<path d="M${startX},${startY} Q${cx},${cy} ${endX},${endY}" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="6 3" opacity="0.7"/>`;
}

function renderWindowGrill(geom, color) {
  const { startX, startY, endX, endY } = geom;
  const isH = Math.abs(endY-startY) < 2;
  if (isH) {
    const mid = (startX+endX)/2;
    return `<line x1="${mid}" y1="${startY-4}" x2="${mid}" y2="${startY+4}" stroke="${color}" stroke-width="1.5" opacity="0.6"/>`;
  }
  const mid = (startY+endY)/2;
  return `<line x1="${startX-4}" y1="${mid}" x2="${startX+4}" y2="${mid}" stroke="${color}" stroke-width="1.5" opacity="0.6"/>`;
}

/* ── Features SVG ── */
function renderFeaturesSvg(features, { x, y, scale, width, length }) {
  return features.map((feature) => {
    if (feature.type === "alcove") {
      const shape = computeAlcoveShape(feature, scale, x, y, width, length);
      return `
        <g data-feature-id="${feature.id}" data-feature-type="alcove">
          <path d="${shape.path} Z" fill="rgba(33,79,75,0.1)" stroke="#214f4b" stroke-width="1.5" stroke-dasharray="5 4"/>
          <text x="${shape.labelX}" y="${shape.labelY}" fill="#214f4b" font-size="11" text-anchor="middle" font-family="${FONT}">${escapeXml(feature.label||"Alcôve")}</text>
          <text x="${shape.measureX}" y="${shape.measureY}" fill="#214f4b" font-size="10" text-anchor="middle" font-family="${FONT}">${formatMeters(feature.width)}×${formatMeters(feature.depth)} m</text>
          ${renderFeatureMoveHandle(feature.id,shape.moveHandleX,shape.moveHandleY)}
          ${renderFeatureHandle(feature.id,"start",shape.startHandleX,shape.startHandleY)}
          ${renderFeatureHandle(feature.id,"end",shape.endHandleX,shape.endHandleY)}
          ${renderFeatureHandle(feature.id,"depth",shape.depthHandleX,shape.depthHandleY)}
        </g>`;
    }
    if (feature.type === "roundedWall") {
      const curve = computeRoundedWallShape(feature, scale, x, y, width, length);
      return `
        <g data-feature-id="${feature.id}" data-feature-type="roundedWall">
          <path d="${curve.erasePath}" fill="none" stroke="#fffdf8" stroke-width="${curve.eraseWidth}" stroke-linecap="round"/>
          <path d="${curve.path}" fill="none" stroke="#214f4b" stroke-width="${curve.strokeWidth}" stroke-linecap="round"/>
          <circle cx="${curve.startX}" cy="${curve.startY}" r="4" fill="#214f4b"/>
          <circle cx="${curve.endX}" cy="${curve.endY}" r="4" fill="#214f4b"/>
          <text x="${curve.labelX}" y="${curve.labelY}" fill="#214f4b" font-size="11" text-anchor="middle" font-family="${FONT}">${escapeXml(feature.label||"Mur arrondi")}</text>
          ${renderFeatureMoveHandle(feature.id,curve.moveHandleX,curve.moveHandleY)}
          ${renderFeatureHandle(feature.id,"start",curve.startX,curve.startY)}
          ${renderFeatureHandle(feature.id,"end",curve.endX,curve.endY)}
          ${renderFeatureHandle(feature.id,"depth",curve.controlX,curve.controlY)}
        </g>`;
    }
    if (feature.type === "pillar") {
      const px=x+feature.x*scale, py=y+feature.y*scale, pw=feature.width*scale, ph=feature.height*scale;
      return `
        <g>
          <rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="rgba(180,100,45,0.14)" stroke="#b8642d" stroke-width="2"/>
          <text x="${px+pw/2}" y="${py-7}" fill="#b8642d" font-size="11" text-anchor="middle" font-family="${FONT}">${escapeXml(feature.label||"Poteau")}</text>
          <text x="${px+pw/2}" y="${py+ph+15}" fill="#b8642d" font-size="10" text-anchor="middle" font-family="${FONT}">${formatMeters(feature.width)} m</text>
        </g>`;
    }
    // line
    const lx1=x+feature.x1*scale, ly1=y+feature.y1*scale, lx2=x+feature.x2*scale, ly2=y+feature.y2*scale;
    const lineLen = Math.hypot(feature.x2-feature.x1, feature.y2-feature.y1);
    const midX=(lx1+lx2)/2, midY=(ly1+ly2)/2;
    return `
      <g>
        <line x1="${lx1}" y1="${ly1}" x2="${lx2}" y2="${ly2}" stroke="#7a4f25" stroke-width="2.5" stroke-dasharray="7 5"/>
        <circle cx="${lx1}" cy="${ly1}" r="4" fill="#7a4f25"/>
        <circle cx="${lx2}" cy="${ly2}" r="4" fill="#7a4f25"/>
        <text x="${midX}" y="${midY-9}" fill="#7a4f25" font-size="11" text-anchor="middle" font-family="${FONT}">${escapeXml(feature.label||"Ligne libre")}</text>
        <text x="${midX}" y="${midY+14}" fill="#7a4f25" font-size="10" text-anchor="middle" font-family="${FONT}">${formatMeters(lineLen)} m</text>
      </g>`;
  }).join("");
}

/* ── Furnishings SVG ── */
function renderFurnishingsSvg(items, { x, y, scale }) {
  const markup = items.map((item) => {
    const fill = { tv:"#303030", sofa:"#b08f6a", bed:"#7fa8bf", wardrobe:"#8a7559", fridge:"#a0b0ba", counter:"#bca07f", island:"#c8b89a" }[item.type] || "#b0a080";
    const px=x+item.x*scale, py=y+item.y*scale, pw=item.width*scale, ph=item.height*scale;
    const selClass = state.selectedFurnishingId===item.id ? "is-selected" : "";
    const detail = renderFurnitureDetail(item, px, py, pw, ph, fill);
    return `
      <g data-furnishing-id="${item.id}" class="${selClass}">
        <rect class="furnishing-hit" x="${px-10}" y="${py-10}" width="${pw+20}" height="${ph+20}" rx="10"/>
        <rect class="furnishing-body" x="${px}" y="${py}" width="${pw}" height="${ph}" rx="10" fill="${fill}" fill-opacity="0.22" stroke="${fill}" stroke-width="2"/>
        ${detail}
        <text class="furnishing-label" x="${px+pw/2}" y="${py+ph/2+4}" fill="#1f2a2c" font-size="11" text-anchor="middle">${escapeXml(item.shortLabel||item.label)}</text>
      </g>`;
  }).join("");
  const selected = items.find((it)=>it.id===state.selectedFurnishingId);
  return markup + (selected ? renderFurnishingToolbar(selected, { x,y,scale }) : "");
}

function renderFurnitureDetail(item, px, py, pw, ph, fill) {
  switch (item.type) {
    case "sofa": {
      const n = Math.max(2, Math.floor(pw/55));
      const cw = (pw-8-(n-1)*4)/n;
      return Array.from({length:n},(_,i)=>`<rect x="${px+4+i*(cw+4)}" y="${py+5}" width="${cw}" height="${ph-10}" rx="5" fill="${fill}" fill-opacity="0.45"/>`).join("");
    }
    case "tv":
      return `<rect x="${px+4}" y="${py+3}" width="${pw-8}" height="${ph-6}" rx="2" fill="#111827" fill-opacity="0.65"/>
              <line x1="${px+pw/2}" y1="${py+ph}" x2="${px+pw/2}" y2="${py+ph+7}" stroke="${fill}" stroke-width="2"/>`;
    case "bed": {
      const pillH=ph*0.22;
      return `<rect x="${px+8}" y="${py+6}" width="${pw-16}" height="${pillH}" rx="6" fill="white" fill-opacity="0.72"/>
              <line x1="${px+pw/2}" y1="${py+pillH+10}" x2="${px+pw/2}" y2="${py+ph-6}" stroke="${fill}" stroke-width="1.2" stroke-dasharray="4 3"/>`;
    }
    case "wardrobe":
      return `<line x1="${px+pw/2}" y1="${py+4}" x2="${px+pw/2}" y2="${py+ph-4}" stroke="${fill}" stroke-width="1.5"/>
              <circle cx="${px+pw/2-7}" cy="${py+ph/2}" r="3" fill="${fill}" fill-opacity="0.8"/>
              <circle cx="${px+pw/2+7}" cy="${py+ph/2}" r="3" fill="${fill}" fill-opacity="0.8"/>`;
    case "fridge":
      return `<rect x="${px+6}" y="${py+5}" width="${pw-12}" height="${ph*0.3}" rx="3" fill="${fill}" fill-opacity="0.5"/>
              <rect x="${px+6}" y="${py+ph*0.34}" width="${pw-12}" height="${ph*0.6}" rx="3" fill="${fill}" fill-opacity="0.28"/>`;
    case "counter": {
      const r=Math.min(pw*0.1, ph*0.3, 12);
      return `<rect x="${px+5}" y="${py+5}" width="${pw-10}" height="${ph-10}" rx="3" fill="${fill}" fill-opacity="0.18"/>
              <circle cx="${px+pw*0.28}" cy="${py+ph/2}" r="${r}" fill="none" stroke="${fill}" stroke-width="1.5"/>
              <circle cx="${px+pw*0.52}" cy="${py+ph/2}" r="${r*0.75}" fill="none" stroke="${fill}" stroke-width="1.5"/>`;
    }
    case "island":
      return `<rect x="${px+8}" y="${py+8}" width="${pw-16}" height="${ph-16}" rx="4" fill="${fill}" fill-opacity="0.15" stroke="${fill}" stroke-width="1" stroke-dasharray="4 3"/>`;
    default: return "";
  }
}

function renderFurnishingToolbar(item, { x, y, scale }) {
  const px=x+normalizeDimension(item.x,0)*scale;
  const py=y+normalizeDimension(item.y,0)*scale;
  const pw=normalizeDimension(item.width,0.8)*scale;
  const ph=normalizeDimension(item.height,0.5)*scale;
  const tcx=px+pw/2, tcy=py-46;
  return `
    <g class="furnishing-toolbar">
      <rect x="${tcx-70}" y="${tcy-18}" width="140" height="36" rx="18" fill="#1c2a2b" fill-opacity="0.92"/>
      <g data-furnishing-id="${item.id}" data-furnishing-action="rotate" class="toolbar-btn">
        <circle cx="${tcx-44}" cy="${tcy}" r="13" fill="rgba(45,122,120,0.85)"/>
        <text x="${tcx-44}" y="${tcy+5}" text-anchor="middle" fill="white" font-size="15" font-family="system-ui">↻</text>
      </g>
      <g data-furnishing-id="${item.id}" data-furnishing-action="duplicate" class="toolbar-btn">
        <circle cx="${tcx}" cy="${tcy}" r="13" fill="rgba(45,122,120,0.85)"/>
        <text x="${tcx}" y="${tcy+4}" text-anchor="middle" fill="white" font-size="12" font-family="system-ui">⧉</text>
      </g>
      <g data-furnishing-id="${item.id}" data-furnishing-action="delete" class="toolbar-btn">
        <circle cx="${tcx+44}" cy="${tcy}" r="13" fill="rgba(192,57,43,0.85)"/>
        <text x="${tcx+44}" y="${tcy+5}" text-anchor="middle" fill="white" font-size="13" font-family="system-ui">✕</text>
      </g>
      <rect x="${px-4}" y="${py-4}" width="${pw+8}" height="${ph+8}" rx="12" fill="none" stroke="#2d7a78" stroke-width="2" stroke-dasharray="6 3"/>
    </g>`;
}

/* ── Scale bar ── */
function renderScaleBar({ x, y, planWidth, planHeight, scale }) {
  const barM = scale >= 60 ? 1 : 2;
  const barPx = barM * scale;
  const bx = x + planWidth - barPx - 16, by = y + planHeight + 50;
  return `
    <line x1="${bx}" y1="${by}" x2="${bx+barPx}" y2="${by}" stroke="#657172" stroke-width="3" stroke-linecap="round"/>
    <line x1="${bx}" y1="${by-5}" x2="${bx}" y2="${by+5}" stroke="#657172" stroke-width="2"/>
    <line x1="${bx+barPx}" y1="${by-5}" x2="${bx+barPx}" y2="${by+5}" stroke="#657172" stroke-width="2"/>
    <text x="${bx+barPx/2}" y="${by-8}" fill="#657172" font-size="10" text-anchor="middle" font-family="${FONT}">${barM} m</text>`;
}

/* ── Dimension lines ── */
function renderDimensionLines({ x,y,planWidth,planHeight,width,length }) {
  return `
    <line x1="${x}" y1="${y+planHeight+68}" x2="${x+planWidth}" y2="${y+planHeight+68}" stroke="#657172" stroke-width="1.5" marker-start="url(#arr)" marker-end="url(#arr)"/>
    <line x1="${x}" y1="${y+planHeight+52}" x2="${x}" y2="${y+planHeight+84}" stroke="#657172" stroke-width="1.5"/>
    <line x1="${x+planWidth}" y1="${y+planHeight+52}" x2="${x+planWidth}" y2="${y+planHeight+84}" stroke="#657172" stroke-width="1.5"/>
    <text x="${x+planWidth/2}" y="${y+planHeight+62}" fill="#1f2a2c" font-size="14" text-anchor="middle" font-family="${FONT}">${formatMeters(width)} m</text>
    <line x1="${x-68}" y1="${y}" x2="${x-68}" y2="${y+planHeight}" stroke="#657172" stroke-width="1.5" marker-start="url(#arr)" marker-end="url(#arr)"/>
    <line x1="${x-52}" y1="${y}" x2="${x-84}" y2="${y}" stroke="#657172" stroke-width="1.5"/>
    <line x1="${x-52}" y1="${y+planHeight}" x2="${x-84}" y2="${y+planHeight}" stroke="#657172" stroke-width="1.5"/>
    <text x="${x-82}" y="${y+planHeight/2}" fill="#1f2a2c" font-size="14" text-anchor="middle" font-family="${FONT}" transform="rotate(-90 ${x-82} ${y+planHeight/2})">${formatMeters(length)} m</text>`;
}

/* ── Wall labels ── */
function renderWallLabels({ x,y,planWidth,planHeight }) {
  return [
    { t:"Mur haut",    tx:x+planWidth/2, ty:y+32 },
    { t:"Mur bas",     tx:x+planWidth/2, ty:y+planHeight-18 },
    { t:"Mur gauche",  tx:x+54,          ty:y+planHeight/2 },
    { t:"Mur droite",  tx:x+planWidth-54,ty:y+planHeight/2 },
  ].map(({t,tx,ty})=>`<text x="${tx}" y="${ty}" fill="#8a7559" font-size="12" text-anchor="middle" font-family="${FONT}">${t}</text>`).join("");
}

/* ── Plan notes SVG ── */
function renderPlanNotes() {
  return state.planNotes.map((note) => {
    const w=Math.max(110,Math.min(240,note.text.length*7+28));
    const bx=note.x+12, by=note.y-18;
    const sel=state.selectedPlanNoteId===note.id;
    return `
      <g data-plan-note-id="${note.id}">
        <line x1="${note.x}" y1="${note.y}" x2="${bx}" y2="${by+16}" stroke="${sel?"#b8642d":"#214f4b"}" stroke-width="1.4"/>
        <circle cx="${note.x}" cy="${note.y}" r="5" fill="${sel?"#b8642d":"#214f4b"}"/>
        <rect x="${bx}" y="${by}" rx="10" width="${w}" height="32" fill="#fffdf8" stroke="${sel?"#b8642d":"#214f4b"}" stroke-width="1.2"/>
        <text x="${bx+10}" y="${by+21}" fill="#214f4b" font-size="12" font-family="${FONT}">${escapeXml(note.text)}</text>
      </g>`;
  }).join("");
}

/* ── Cartouche notes ── */
function renderCartoucheNotes(svgH) {
  const lines = wrapText(state.projectNotes||"—", 90);
  const cartH = 220;
  return lines.slice(0,3).map((l,i)=>
    `<text x="150" y="${svgH-cartH+150+i*20}" fill="#1f2a2c" font-size="13" font-family="${FONT}">${escapeXml(l)}</text>`
  ).join("");
}

/* ── Opening measurements ── */
function renderOpeningMeasurements(openings, geometry) {
  const byWall = { top:[], right:[], bottom:[], left:[] };
  openings.forEach((o) => byWall[o.wall].push(o));
  return Object.entries(byWall).map(([wall,entries])=>
    entries.sort((a,b)=>a.offset-b.offset).map((o,i)=>renderOpeningMeasurementForWall(o,wall,i,geometry)).join("")
  ).join("");
}
function renderOpeningMeasurementForWall(op, wall, idx, geometry) {
  const og = computeOpeningGeometry(op, geometry);
  const offLbl = `${formatMeters(op.offset)} m`;
  const widLbl = `${formatMeters(op.width)} m`;
  const span = (wall==="top"||wall==="bottom") ? geometry.width : geometry.length;
  const remLbl = `${formatMeters(Math.max(0,span-op.offset-op.width))} m`;
  const lane = 36;
  if (wall==="top") {
    const dy=geometry.y-80-idx*lane;
    return renderHDim(geometry.x,og.startX,geometry.y,dy,offLbl,OFFSET_COLOR,"arrOff")+
           renderHDim(og.startX,og.endX,geometry.y,dy+18,widLbl,OPENING_COLOR,"arrOp")+
           renderHDim(og.endX,geometry.x+geometry.planWidth,geometry.y,dy+36,remLbl,OFFSET_COLOR,"arrOff");
  }
  if (wall==="bottom") {
    const dy=geometry.y+geometry.planHeight+90+idx*lane;
    return renderHDim(geometry.x,og.startX,geometry.y+geometry.planHeight,dy,offLbl,OFFSET_COLOR,"arrOff")+
           renderHDim(og.startX,og.endX,geometry.y+geometry.planHeight,dy+18,widLbl,OPENING_COLOR,"arrOp")+
           renderHDim(og.endX,geometry.x+geometry.planWidth,geometry.y+geometry.planHeight,dy+36,remLbl,OFFSET_COLOR,"arrOff");
  }
  if (wall==="left") {
    const dx=geometry.x-130-idx*lane;
    return renderVDim(geometry.y,og.startY,geometry.x,dx,offLbl,OFFSET_COLOR,"arrOff")+
           renderVDim(og.startY,og.endY,geometry.x,dx-18,widLbl,OPENING_COLOR,"arrOp")+
           renderVDim(og.endY,geometry.y+geometry.planHeight,geometry.x,dx-36,remLbl,OFFSET_COLOR,"arrOff");
  }
  const dx=geometry.x+geometry.planWidth+130+idx*lane;
  return renderVDim(geometry.y,og.startY,geometry.x+geometry.planWidth,dx,offLbl,OFFSET_COLOR,"arrOff")+
         renderVDim(og.startY,og.endY,geometry.x+geometry.planWidth,dx+18,widLbl,OPENING_COLOR,"arrOp")+
         renderVDim(og.endY,geometry.y+geometry.planHeight,geometry.x+geometry.planWidth,dx+36,remLbl,OFFSET_COLOR,"arrOff");
}
function renderHDim(x1,x2,wallY,dimY,label,color,markerId) {
  if(Math.abs(x2-x1)<2)return "";
  return `<line x1="${x1}" y1="${wallY}" x2="${x1}" y2="${dimY}" stroke="${color}" stroke-width="1.2"/>
          <line x1="${x2}" y1="${wallY}" x2="${x2}" y2="${dimY}" stroke="${color}" stroke-width="1.2"/>
          <line x1="${x1}" y1="${dimY}" x2="${x2}" y2="${dimY}" stroke="${color}" stroke-width="1.5" marker-start="url(#${markerId})" marker-end="url(#${markerId})"/>
          <text x="${(x1+x2)/2}" y="${dimY-5}" fill="${color}" font-size="11" text-anchor="middle" font-family="${FONT}">${label}</text>`;
}
function renderVDim(y1,y2,wallX,dimX,label,color,markerId) {
  if(Math.abs(y2-y1)<2)return "";
  const tx=dimX+(dimX<wallX?-8:8);
  return `<line x1="${wallX}" y1="${y1}" x2="${dimX}" y2="${y1}" stroke="${color}" stroke-width="1.2"/>
          <line x1="${wallX}" y1="${y2}" x2="${dimX}" y2="${y2}" stroke="${color}" stroke-width="1.2"/>
          <line x1="${dimX}" y1="${y1}" x2="${dimX}" y2="${y2}" stroke="${color}" stroke-width="1.5" marker-start="url(#${markerId})" marker-end="url(#${markerId})"/>
          <text x="${tx}" y="${(y1+y2)/2}" fill="${color}" font-size="11" text-anchor="middle" font-family="${FONT}" transform="rotate(-90 ${tx} ${(y1+y2)/2})">${label}</text>`;
}

/* ── Segment labels ── */
function renderOutlineSegmentLabels({ x,y,width,length,scale,alcoves,roundedWalls }) {
  const segs = buildRoomOutlineCommands({x,y,width,length,scale,alcoves,roundedWalls});
  return segs.filter((s)=>{
    const m=s.kind==="curve"?s.meters:Math.hypot(s.x2-s.x1,s.y2-s.y1)/scale;
    return m>=0.25;
  }).map((s)=>{
    const dx=s.x2-s.x1, dy=s.y2-s.y1;
    const m=s.kind==="curve"?s.meters:Math.hypot(dx,dy)/scale;
    const mx=(s.x1+s.x2)/2, my=(s.y1+s.y2)/2;
    const isH=Math.abs(dy)<0.01;
    const ox=isH?0:(dx>=0?16:-16), oy=s.kind==="curve"?-24:(isH?-13:0);
    const tx=mx+ox, ty=my+oy;
    const rot=isH?"":`transform="rotate(-90 ${tx} ${ty})"`;
    return `<g><rect x="${tx-19}" y="${ty-11}" width="38" height="14" rx="7" fill="rgba(255,253,248,0.92)"/><text x="${tx}" y="${ty}" fill="#214f4b" font-size="10" text-anchor="middle" font-family="${FONT}" ${rot}>${formatMeters(m)} m</text></g>`;
  }).join("");
}

/* ── Geometry helpers ── */
function computeOpeningGeometry(op, geometry) {
  const sw = normalizeDimension(op.width, 0.9);
  const so = normalizeDimension(op.offset, 0);
  const { x,y,planWidth,planHeight,scale } = geometry;
  if (op.wall==="top"||op.wall==="bottom") {
    const sx=x+so*scale, ex=sx+sw*scale;
    const wy=op.wall==="top"?y:y+planHeight;
    return { startX:sx,startY:wy,endX:ex,endY:wy,centerX:(sx+ex)/2,centerY:wy,labelX:(sx+ex)/2,labelY:op.wall==="top"?wy+52:wy-30 };
  }
  const sy=y+so*scale, ey=sy+sw*scale;
  const wx=op.wall==="left"?x:x+planWidth;
  return { startX:wx,startY:sy,endX:wx,endY:ey,centerX:wx,centerY:(sy+ey)/2,labelX:op.wall==="left"?wx+82:wx-82,labelY:(sy+ey)/2 };
}

function computeAlcoveShape(feature, scale, ox, oy, rw, rl) {
  const out = feature.direction==="outward";
  if (feature.wall==="top") {
    const x1=ox+feature.offset*scale, x2=ox+(feature.offset+feature.width)*scale;
    const y1=oy, y2=oy+(out?-feature.depth:feature.depth)*scale;
    return { path:`M${x1} ${y1}L${x1} ${y2}L${x2} ${y2}L${x2} ${y1}`, labelX:(x1+x2)/2, labelY:out?y2-8:y2+17, measureX:(x1+x2)/2, measureY:out?y2-22:y2+30, moveHandleX:(x1+x2)/2,moveHandleY:y1, startHandleX:x1,startHandleY:y1, endHandleX:x2,endHandleY:y1, depthHandleX:(x1+x2)/2,depthHandleY:y2 };
  }
  if (feature.wall==="right") {
    const x1=ox+rw*scale, x2=x1+(out?feature.depth:-feature.depth)*scale;
    const y1=oy+feature.offset*scale, y2=oy+(feature.offset+feature.width)*scale;
    return { path:`M${x1} ${y1}L${x2} ${y1}L${x2} ${y2}L${x1} ${y2}`, labelX:out?x2+24:x2-24, labelY:(y1+y2)/2-4, measureX:out?x2+24:x2-24, measureY:(y1+y2)/2+12, moveHandleX:x1,moveHandleY:(y1+y2)/2, startHandleX:x1,startHandleY:y1, endHandleX:x1,endHandleY:y2, depthHandleX:x2,depthHandleY:(y1+y2)/2 };
  }
  if (feature.wall==="bottom") {
    const x1=ox+feature.offset*scale, x2=ox+(feature.offset+feature.width)*scale;
    const y1=oy+rl*scale, y2=y1+(out?feature.depth:-feature.depth)*scale;
    return { path:`M${x1} ${y1}L${x1} ${y2}L${x2} ${y2}L${x2} ${y1}`, labelX:(x1+x2)/2, labelY:out?y2+17:y2-8, measureX:(x1+x2)/2, measureY:out?y2+30:y2-22, moveHandleX:(x1+x2)/2,moveHandleY:y1, startHandleX:x1,startHandleY:y1, endHandleX:x2,endHandleY:y1, depthHandleX:(x1+x2)/2,depthHandleY:y2 };
  }
  const x1=ox, x2=ox+(out?-feature.depth:feature.depth)*scale;
  const y1=oy+feature.offset*scale, y2=oy+(feature.offset+feature.width)*scale;
  return { path:`M${x1} ${y1}L${x2} ${y1}L${x2} ${y2}L${x1} ${y2}`, labelX:out?x2-24:x2+24, labelY:(y1+y2)/2-4, measureX:out?x2-24:x2+24, measureY:(y1+y2)/2+12, moveHandleX:x1,moveHandleY:(y1+y2)/2, startHandleX:x1,startHandleY:y1, endHandleX:x1,endHandleY:y2, depthHandleX:x2,depthHandleY:(y1+y2)/2 };
}

function computeRoundedWallShape(feature, scale, ox, oy, rw, rl) {
  const sw=8, ew=18, out=feature.direction==="outward";
  if (feature.wall==="top") {
    const sx=ox+feature.start*scale, ex=ox+feature.end*scale, y=oy;
    const cy=y+(out?-feature.depth:feature.depth)*scale;
    return { path:`M${sx} ${y}Q${(sx+ex)/2} ${cy} ${ex} ${y}`, erasePath:`M${sx} ${y}L${ex} ${y}`, startX:sx,startY:y,endX:ex,endY:y,controlX:(sx+ex)/2,controlY:cy, moveHandleX:(sx+ex)/2,moveHandleY:y, labelX:(sx+ex)/2,labelY:out?cy-10:cy+20,strokeWidth:sw,eraseWidth:ew };
  }
  if (feature.wall==="bottom") {
    const sx=ox+feature.start*scale, ex=ox+feature.end*scale, y=oy+rl*scale;
    const cy=y+(out?feature.depth:-feature.depth)*scale;
    return { path:`M${sx} ${y}Q${(sx+ex)/2} ${cy} ${ex} ${y}`, erasePath:`M${sx} ${y}L${ex} ${y}`, startX:sx,startY:y,endX:ex,endY:y,controlX:(sx+ex)/2,controlY:cy, moveHandleX:(sx+ex)/2,moveHandleY:y, labelX:(sx+ex)/2,labelY:out?cy+22:cy-10,strokeWidth:sw,eraseWidth:ew };
  }
  if (feature.wall==="right") {
    const x=ox+rw*scale, sy=oy+feature.start*scale, ey=oy+feature.end*scale;
    const cx=x+(out?feature.depth:-feature.depth)*scale;
    return { path:`M${x} ${sy}Q${cx} ${(sy+ey)/2} ${x} ${ey}`, erasePath:`M${x} ${sy}L${x} ${ey}`, startX:x,startY:sy,endX:x,endY:ey,controlX:cx,controlY:(sy+ey)/2, moveHandleX:x,moveHandleY:(sy+ey)/2, labelX:out?cx+34:cx-34,labelY:(sy+ey)/2,strokeWidth:sw,eraseWidth:ew };
  }
  const x=ox, sy=oy+feature.start*scale, ey=oy+feature.end*scale;
  const cx=x+(out?-feature.depth:feature.depth)*scale;
  return { path:`M${x} ${sy}Q${cx} ${(sy+ey)/2} ${x} ${ey}`, erasePath:`M${x} ${sy}L${x} ${ey}`, startX:x,startY:sy,endX:x,endY:ey,controlX:cx,controlY:(sy+ey)/2, moveHandleX:x,moveHandleY:(sy+ey)/2, labelX:out?cx-34:cx+34,labelY:(sy+ey)/2,strokeWidth:sw,eraseWidth:ew };
}

function renderFeatureHandle(id, handle, x, y) {
  const lbl={start:"Début",end:"Fin",depth:"Prof."}[handle]||handle;
  return `
    <g class="feature-handle-group" data-feature-id="${id}" data-feature-handle="${handle}">
      <circle class="feature-handle-hit" data-feature-id="${id}" data-feature-handle="${handle}" cx="${x}" cy="${y}" r="22"/>
      <circle class="feature-handle-pulse" cx="${x}" cy="${y}" r="13"/>
      <circle class="feature-handle" data-feature-id="${id}" data-feature-handle="${handle}" cx="${x}" cy="${y}" r="10"/>
      <text class="feature-handle-letter" data-feature-id="${id}" data-feature-handle="${handle}" x="${x}" y="${y+3}" text-anchor="middle">${lbl[0]}</text>
    </g>`;
}
function renderFeatureMoveHandle(id, x, y) {
  return `
    <g class="feature-move-group" data-feature-id="${id}" data-feature-handle="move">
      <circle class="feature-move-hit" data-feature-id="${id}" data-feature-handle="move" cx="${x}" cy="${y}" r="20"/>
      <circle class="feature-move-handle" data-feature-id="${id}" data-feature-handle="move" cx="${x}" cy="${y}" r="11"/>
      <text class="feature-move-letter" data-feature-id="${id}" data-feature-handle="move" x="${x}" y="${y+4}" text-anchor="middle">M</text>
    </g>`;
}

/* ── Plan interactions ── */
function bindPlanInteractions() {
  const svg = els.planContainer.querySelector("svg");
  if (!svg) return;
  svg.addEventListener("pointerdown", (e) => {
    if (state.noteMode) { e.preventDefault(); placePlanNote(e, svg); return; }
    const note = e.target.closest("[data-plan-note-id]");
    if (note) { e.preventDefault(); state.selectedPlanNoteId=note.dataset.planNoteId; state.selectedFurnishingId=null; renderPlanNoteStatus(); startNoteDrag(note.dataset.planNoteId); return; }
    const toolbarBtn = e.target.closest("[data-furnishing-action]");
    if (toolbarBtn) { e.preventDefault(); applyFurnishingAction(toolbarBtn.dataset.furnishingId, toolbarBtn.dataset.furnishingAction); return; }
    const furnishing = e.target.closest("[data-furnishing-id]");
    if (furnishing) { e.preventDefault(); startFurnishingDrag(furnishing.dataset.furnishingId); return; }
    const fHandle = e.target.closest("[data-feature-handle]");
    if (fHandle) { e.preventDefault(); startFeatureDrag(fHandle.dataset.featureId, fHandle.dataset.featureHandle||"move"); return; }
    const opening = e.target.closest("[data-opening-id]");
    if (!opening) { if (state.selectedFurnishingId||state.selectedPlanNoteId) { state.selectedFurnishingId=null; state.selectedPlanNoteId=null; renderPlanNoteStatus(); renderPlan(); } return; }
    e.preventDefault(); state.selectedFurnishingId=null; startOpeningDrag(opening.dataset.openingId);
  });
}

function startOpeningDrag(id) { dragState={type:"opening",id,moved:false}; startDrag(); }
function startNoteDrag(id)    { dragState={type:"note",id,moved:false};    startDrag(); }
function startFeatureDrag(id, handle) { dragState={type:"feature",id,handle,moved:false}; startDrag(); }
function startFurnishingDrag(id) {
  state.selectedFurnishingId=id; state.selectedPlanNoteId=null;
  renderPlanNoteStatus(); renderPlan();
  dragState={type:"furnishing",id,moved:false}; startDrag();
}
function startDrag() {
  document.body.classList.add("dragging-opening");
  window.addEventListener("pointermove", handlePointerDrag);
  window.addEventListener("pointerup", stopPointerDrag);
}
function handlePointerDrag(e) {
  if (!dragState||!latestPlanGeometry) return;
  const svg=els.planContainer.querySelector("svg"); if (!svg) return;
  const pt=getSvgPoint(svg,e);
  if (dragState.type==="opening")   moveOpeningToPoint(dragState.id,pt,latestPlanGeometry);
  else if (dragState.type==="note") moveNoteToPoint(dragState.id,pt);
  else if (dragState.type==="furnishing") moveFurnishingToPoint(dragState.id,pt,latestPlanGeometry);
  else if (dragState.type==="feature")    moveFeatureToPoint(dragState.id,dragState.handle,pt,latestPlanGeometry);
  dragState.moved=true; renderPlan();
}
function stopPointerDrag() {
  window.removeEventListener("pointermove",handlePointerDrag);
  window.removeEventListener("pointerup",stopPointerDrag);
  document.body.classList.remove("dragging-opening");
  if (dragState?.moved) persistAndRender();
  dragState=null;
}
function moveOpeningToPoint(id, pt, geom) {
  const op=state.openings.find((o)=>o.id===id); if (!op) return;
  const proj=projectPointToRoomEdge(pt,geom,normalizeDimension(op.width,0.9));
  op.wall=proj.wall; op.offset=roundTo2(proj.offset);
}
function moveNoteToPoint(id, pt) {
  const n=state.planNotes.find((n)=>n.id===id); if (!n) return;
  n.x=roundTo2(pt.x); n.y=roundTo2(pt.y);
}
function moveFurnishingToPoint(id, pt, geom) {
  const item=state.furnishings.find((f)=>f.id===id); if (!item) return;
  const w=normalizeDimension(item.width,0.8), h=normalizeDimension(item.height,0.5);
  const snap=Math.max(0.12,Math.min(0.22,Math.min(geom.width,geom.length)*0.04));
  let nx=clamp((pt.x-geom.x)/geom.scale-w/2,0,Math.max(0,geom.width-w));
  let ny=clamp((pt.y-geom.y)/geom.scale-h/2,0,Math.max(0,geom.length-h));
  if (nx<=snap) nx=0; if (ny<=snap) ny=0;
  if (Math.abs(geom.width-(nx+w))<=snap)  nx=Math.max(0,geom.width-w);
  if (Math.abs(geom.length-(ny+h))<=snap) ny=Math.max(0,geom.length-h);
  item.x=roundTo2(nx); item.y=roundTo2(ny);
}
function moveFeatureToPoint(id, handle, pt, geom) {
  const ft=state.features.find((f)=>f.id===id); if (!ft) return;
  if (ft.type==="alcove")     updateAlcoveFromDrag(ft,handle,pt,geom);
  if (ft.type==="roundedWall") updateRoundedWallFromDrag(ft,handle,pt,geom);
}
function updateAlcoveFromDrag(ft, handle, pt, geom) {
  const nft=normalizeFeatures([ft],geom.width,geom.length)[0];
  const span=(nft.wall==="top"||nft.wall==="bottom")?geom.width:geom.length;
  const min=0.2;
  if (handle==="move") { const loc=getWallAxisValue(pt,nft.wall,geom); ft.offset=roundTo2(clamp(loc-nft.width/2,0,Math.max(0,span-nft.width))); return; }
  if (handle==="start") { const end=nft.offset+nft.width,ns=clamp(getWallAxisValue(pt,nft.wall,geom),0,Math.max(0,end-min)); ft.offset=roundTo2(ns); ft.width=roundTo2(Math.max(min,end-ns)); return; }
  if (handle==="end") { ft.width=roundTo2(Math.max(min,clamp(getWallAxisValue(pt,nft.wall,geom),nft.offset+min,span)-nft.offset)); return; }
  const d=getWallDepthValue(pt,nft.wall,geom); ft.direction=d.direction; ft.depth=roundTo2(d.depth);
}
function updateRoundedWallFromDrag(ft, handle, pt, geom) {
  const nft=normalizeFeatures([ft],geom.width,geom.length)[0];
  const span=(nft.wall==="top"||nft.wall==="bottom")?geom.width:geom.length;
  const min=0.2;
  if (handle==="move") { const sz=nft.end-nft.start,loc=getWallAxisValue(pt,nft.wall,geom),ns=clamp(loc-sz/2,0,Math.max(0,span-sz)); ft.start=roundTo2(ns); ft.end=roundTo2(ns+sz); return; }
  if (handle==="start") { ft.start=roundTo2(clamp(getWallAxisValue(pt,nft.wall,geom),0,Math.max(0,nft.end-min))); return; }
  if (handle==="end")   { ft.end  =roundTo2(clamp(getWallAxisValue(pt,nft.wall,geom),nft.start+min,span)); return; }
  const d=getWallDepthValue(pt,nft.wall,geom); ft.direction=d.direction; ft.depth=roundTo2(d.depth);
}
function getWallAxisValue(pt, wall, geom) {
  return (wall==="top"||wall==="bottom")
    ? clamp((pt.x-geom.x)/geom.scale,0,geom.width)
    : clamp((pt.y-geom.y)/geom.scale,0,geom.length);
}
function getWallDepthValue(pt, wall, geom) {
  const half=Math.min(geom.width,geom.length)/2;
  if (wall==="top")    { const d=(pt.y-geom.y)/geom.scale;   return {direction:d<0?"outward":"inward",depth:clamp(Math.abs(d),0.1,half)}; }
  if (wall==="bottom") { const d=(pt.y-(geom.y+geom.planHeight))/geom.scale; return {direction:d>0?"outward":"inward",depth:clamp(Math.abs(d),0.1,half)}; }
  if (wall==="right")  { const d=(pt.x-(geom.x+geom.planWidth))/geom.scale; return {direction:d>0?"outward":"inward",depth:clamp(Math.abs(d),0.1,half)}; }
  const d=(pt.x-geom.x)/geom.scale; return {direction:d<0?"outward":"inward",depth:clamp(Math.abs(d),0.1,half)};
}
function projectPointToRoomEdge(pt, geom, openingWidth) {
  const edges=[
    {wall:"top",    distance:Math.abs(pt.y-geom.y)},
    {wall:"right",  distance:Math.abs(pt.x-(geom.x+geom.planWidth))},
    {wall:"bottom", distance:Math.abs(pt.y-(geom.y+geom.planHeight))},
    {wall:"left",   distance:Math.abs(pt.x-geom.x)},
  ].sort((a,b)=>a.distance-b.distance);
  const wall=edges[0].wall;
  const span=(wall==="top"||wall==="bottom")?geom.width:geom.length;
  const local=(wall==="top"||wall==="bottom")?(pt.x-geom.x)/geom.scale:(pt.y-geom.y)/geom.scale;
  return {wall, offset:clamp(local-openingWidth/2,0,Math.max(0,span-openingWidth))};
}

/* ── Furnishing actions ── */
function addFurniture(type) { state.furnishings.push(createFurniture(type, 0.5, 0.5)); persistAndRender(); }
function createFurniture(type, x=0.5, y=0.5) {
  const cat = { sofa:{label:"Canapé",shortLabel:"Canapé",width:2,height:0.9}, tv:{label:"TV",shortLabel:"TV",width:1.2,height:0.18}, bed:{label:"Lit",shortLabel:"Lit",width:1.6,height:2}, wardrobe:{label:"Armoire",shortLabel:"Armoire",width:1.4,height:0.65}, fridge:{label:"Frigo",shortLabel:"Frigo",width:0.75,height:0.72}, counter:{label:"Plan de travail",shortLabel:"Cuisine",width:2.4,height:0.65}, island:{label:"Îlot central",shortLabel:"Îlot",width:1.8,height:0.9} };
  return { id:makeId(), type, ...(cat[type]||cat.sofa), x, y };
}
function applyFurnishingAction(id, action) {
  if (action==="delete") { state.furnishings=state.furnishings.filter((f)=>f.id!==id); if(state.selectedFurnishingId===id)state.selectedFurnishingId=null; persistAndRender(); return; }
  if (action==="duplicate") { duplicateFurnishing(id); persistAndRender(); return; }
  if (action==="rotate") { rotateFurnishing(id); persistAndRender(); }
}
function duplicateFurnishing(id) {
  const src=state.furnishings.find((f)=>f.id===id); if (!src) return;
  const rw=normalizePositiveNumber(state.roomWidth)||6, rl=normalizePositiveNumber(state.roomLength)||6;
  const w=normalizeDimension(src.width,0.8), h=normalizeDimension(src.height,0.5);
  const clone={...deepCopy(src),id:makeId(),x:roundTo2(clamp(normalizeDimension(src.x,0)+0.3,0,Math.max(0,rw-w))),y:roundTo2(clamp(normalizeDimension(src.y,0)+0.3,0,Math.max(0,rl-h)))};
  state.furnishings.push(clone); state.selectedFurnishingId=clone.id;
}
function rotateFurnishing(id) {
  const item=state.furnishings.find((f)=>f.id===id); if (!item) return;
  const rw=normalizePositiveNumber(state.roomWidth)||6, rl=normalizePositiveNumber(state.roomLength)||6;
  const cw=normalizeDimension(item.width,0.8), ch=normalizeDimension(item.height,0.5);
  item.width=roundTo2(clamp(ch,0.2,rw)); item.height=roundTo2(clamp(cw,0.2,rl));
  item.x=roundTo2(clamp(normalizeDimension(item.x,0),0,Math.max(0,rw-item.width)));
  item.y=roundTo2(clamp(normalizeDimension(item.y,0),0,Math.max(0,rl-item.height)));
  state.selectedFurnishingId=id;
}

/* ── Normalize helpers ── */
function normalizeOpenings(openings, rw, rl) {
  return openings.map((o)=>{
    const wall=["top","right","bottom","left"].includes(o.wall)?o.wall:"bottom";
    const span=(wall==="top"||wall==="bottom")?rw:rl;
    const width=clamp(normalizeDimension(o.width,0.8),0.2,Math.max(0.2,span));
    const offset=clamp(normalizeDimension(o.offset,0),0,Math.max(0,span-width));
    return {...o,wall,width,offset};
  }).sort((a,b)=>a.wall.localeCompare(b.wall)||a.offset-b.offset);
}
function normalizeFurnishings(items, rw, rl) {
  return items.map((it)=>{
    const w=clamp(normalizeDimension(it.width,0.8),0.3,rw), h=clamp(normalizeDimension(it.height,0.5),0.2,rl);
    return {...it,x:clamp(normalizeDimension(it.x,0),0,Math.max(0,rw-w)),y:clamp(normalizeDimension(it.y,0),0,Math.max(0,rl-h)),width:w,height:h};
  });
}
function normalizeFeatures(features, rw, rl) {
  return features.map((ft)=>{
    if (ft.type==="alcove") {
      const wall=["top","right","bottom","left"].includes(ft.wall)?ft.wall:"right";
      const span=(wall==="top"||wall==="bottom")?rw:rl;
      const width=clamp(normalizeDimension(ft.width,0.8),0.2,span);
      const depth=clamp(normalizeDimension(ft.depth,0.3),0.1,Math.min(rw,rl)/2);
      const offset=clamp(normalizeDimension(ft.offset,0),0,Math.max(0,span-width));
      return {...ft,wall,offset,width,depth,direction:ft.direction==="outward"?"outward":"inward"};
    }
    if (ft.type==="roundedWall") {
      const wall=["top","right","bottom","left"].includes(ft.wall)?ft.wall:"top";
      const span=(wall==="top"||wall==="bottom")?rw:rl;
      const rs=normalizeDimension(ft.start,0.5),re=normalizeDimension(ft.end,1.5);
      const start=clamp(Math.min(rs,re),0,Math.max(0,span-0.2)), end=clamp(Math.max(rs,re),start+0.2,span);
      return {...ft,wall,start,end,depth:clamp(normalizeDimension(ft.depth,0.3),0.1,Math.min(rw,rl)/2),direction:ft.direction==="outward"?"outward":"inward"};
    }
    if (ft.type==="pillar") {
      const w=clamp(normalizeDimension(ft.width,0.3),0.1,rw), h=clamp(normalizeDimension(ft.height,0.3),0.1,rl);
      return {...ft,x:clamp(normalizeDimension(ft.x,0),0,Math.max(0,rw-w)),y:clamp(normalizeDimension(ft.y,0),0,Math.max(0,rl-h)),width:w,height:h};
    }
    return {...ft,x1:clamp(normalizeDimension(ft.x1,0),0,rw),y1:clamp(normalizeDimension(ft.y1,0),0,rl),x2:clamp(normalizeDimension(ft.x2,0),0,rw),y2:clamp(normalizeDimension(ft.y2,0),0,rl)};
  });
}

/* ── Export ── */
function exportSvg() {
  const svg=els.planContainer.querySelector("svg"); if (!svg) return;
  const blob=new Blob([svg.outerHTML],{type:"image/svg+xml;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a"); a.href=url; a.download=`${slugify(state.projectName||state.roomName||"plan-2d")}.svg`; a.click();
  URL.revokeObjectURL(url);
}
function printPlan() {
  const svg=els.planContainer.querySelector("svg"); if (!svg) return;
  const win=window.open("","_blank","width=1200,height=900");
  win.document.write(`<html><head><title>${escapeXml(state.projectName||"Plan 2D")}</title><style>body{margin:0;padding:16px;background:#fff}svg{width:100%;height:auto}</style></head><body>${svg.outerHTML}</body></html>`);
  win.document.close(); win.focus(); win.print();
}

/* ── Persistence ── */
function persistState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function persistAndRender() { persistState(); renderAll(); }
function loadState() {
  try {
    const raw=localStorage.getItem(STORAGE_KEY); if (!raw) return initialState();
    const p=JSON.parse(raw);
    return { ...initialState(), ...p,
      calibration:{...initialState().calibration,...(p.calibration||{})},
      furnishings:Array.isArray(p.furnishings)?p.furnishings:[],
      features:Array.isArray(p.features)?p.features:[],
      openings:Array.isArray(p.openings)?p.openings:[],
    };
  } catch { return initialState(); }
}

/* ── Utilities ── */
function parseFieldValue(input) { return input.type!=="number"?input.value:parseNumberish(input.value); }
function parseNumberish(v) { if(v==="")return""; const n=Number(v); return Number.isFinite(n)?n:""; }
function normalizeDimension(v,fallback) { const n=Number(v); return(!Number.isFinite(n)||n<=0)?fallback:n; }
function normalizePositiveNumber(v) { const n=Number(v); return(Number.isFinite(n)&&n>0)?n:null; }
function formatMeters(v) { const n=Number(v); if(!Number.isFinite(n))return"—"; return n.toFixed(2).replace(/\.00$/,""); }
function formatDateTime(v) {
  if (!v) return "—"; const d=new Date(v); if(isNaN(d.getTime()))return"—";
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}
function clamp(v,min,max){return Math.min(Math.max(v,min),max);}
function roundTo2(v){return Math.round(v*100)/100;}
function deepCopy(v){return JSON.parse(JSON.stringify(v));}
function makeId(){return crypto.randomUUID?crypto.randomUUID():`id-${Date.now()}-${Math.random().toString(16).slice(2)}`;}
function safe(v){return String(v).replace(/[&<>"']/g,"");}
function escapeXml(v){return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");}
function slugify(v){return v.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");}
function wrapText(text,maxChars){
  const words=String(text||"—").trim().split(/\s+/);
  const lines=[]; let cur="";
  words.forEach((w)=>{const next=cur?`${cur} ${w}`:w;if(next.length<=maxChars){cur=next;}else{if(cur)lines.push(cur);cur=w.slice(0,maxChars);}});
  if(cur)lines.push(cur); return lines;
}
function getSvgPoint(svg,e){
  const rect=svg.getBoundingClientRect(), vb=svg.viewBox.baseVal;
  return {x:(e.clientX-rect.left)*vb.width/rect.width, y:(e.clientY-rect.top)*vb.height/rect.height};
}
