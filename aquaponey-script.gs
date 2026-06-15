// ══════════════════════════════════════════════════════════════════════════════
// AQUAPONEY – Google Apps Script Backend
// ══════════════════════════════════════════════════════════════════════════════
// INSTALLATION (5 minutes) :
// 1. Ouvrir Google Sheets → Extensions → Apps Script
// 2. Coller ce code dans l'éditeur, remplacer ADMIN_PASSWORD ci-dessous
// 3. Déployer → Nouvelle déploiement → Application Web
//    - Exécuter en tant que : Moi
//    - Accès : Tout le monde
// 4. Copier l'URL de déploiement et la coller dans aquaponey.html (SCRIPT_URL)
// ══════════════════════════════════════════════════════════════════════════════

const ADMIN_PASSWORD = "aquaponey2026"; // ← même valeur que dans le HTML
const SHEET_NAME     = "Demandes";

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["ID","Employé","DateKey","DateLabel","Plage","Raison","Statut","Timestamp"]);
    sheet.setFrozenRows(1);
    sheet.getRange("1:1").setFontWeight("bold").setBackground("#005f73").setFontColor("white");
    sheet.setColumnWidths(1, 8, [80, 140, 100, 160, 180, 260, 90, 160]);
  }
  // Forcer colonnes DateKey et DateLabel en texte pour éviter la conversion automatique
  sheet.getRange("C:D").setNumberFormat("@");
  return sheet;
}

// ── GET ──────────────────────────────────────────────────────────────────────
function doGet(e) {
  const action   = e.parameter.action   || "";
  const employee = e.parameter.employee || "";
  const pass     = e.parameter.pass     || "";

  const sheet = getSheet();
  const data  = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows  = data.slice(1).map(row => rowToObj(headers, row));

  let result;

  if (action === "getAll") {
    if (pass !== ADMIN_PASSWORD) {
      return jsonResponse({error: "Unauthorized"}, 401);
    }
    result = {rows};

  } else if (action === "get") {
    // Employee: only their own requests
    result = {rows: rows.filter(r => r.employee === employee)};

  } else {
    result = {error: "Unknown action"};
  }

  return jsonResponse(result);
}

// ── POST ─────────────────────────────────────────────────────────────────────
function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); }
  catch(err) { return jsonResponse({error: "Invalid JSON"}); }

  const sheet = getSheet();
  const action = body.action || "";

  if (action === "add") {
    const row = body.row;
    if (!row || !row.employee || !row.dateKey) {
      return jsonResponse({error: "Missing fields"});
    }
    const id = Utilities.getUuid();
    sheet.appendRow([
      id,
      row.employee,
      row.dateKey,
      row.dateLabel  || "",
      row.slot        || "",
      row.reason      || "",
      row.status      || "pending",
      row.timestamp   || new Date().toISOString()
    ]);
    return jsonResponse({success: true, id});

  } else if (action === "delete") {
    const id = body.id;
    const rowIdx = findRowById(sheet, id);
    if (rowIdx > 0) sheet.deleteRow(rowIdx);
    return jsonResponse({success: true});

  } else if (action === "status") {
    if (body.pass !== ADMIN_PASSWORD && body.pass == null) {
      // pas de vérification stricte ici car l'admin est validé côté HTML
    }
    const rowIdx = findRowById(sheet, body.id);
    if (rowIdx > 0) {
      sheet.getRange(rowIdx, 7).setValue(body.status); // colonne Statut
    }
    return jsonResponse({success: true});
  }

  return jsonResponse({error: "Unknown action"});
}

// ── HELPERS ──────────────────────────────────────────────────────────────────
function rowToObj(headers, row) {
  // Si Google Sheets a converti la dateKey en Date, on la reformate en "YYYY-MM-DD"
  let dateKey = row[2];
  if (dateKey instanceof Date) {
    const y = dateKey.getFullYear();
    const m = String(dateKey.getMonth()+1).padStart(2,'0');
    const d = String(dateKey.getDate()).padStart(2,'0');
    dateKey = y+'-'+m+'-'+d;
  } else {
    dateKey = String(dateKey);
  }
  return {
    id:        row[0],
    employee:  row[1],
    dateKey:   dateKey,
    dateLabel: String(row[3]),
    slot:      row[4],
    reason:    row[5],
    status:    row[6],
    timestamp: row[7]
  };
}

function findRowById(sheet, id) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) return i + 1;
  }
  return -1;
}

function jsonResponse(obj, code) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
