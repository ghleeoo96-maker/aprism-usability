/**
 * 에이프리즘 사용성 평가 — 온라인 백업(구글 시트에 붙이는 Apps Script)
 *
 * 하는 일
 *   doPost  사이트가 보낸 참가자 기록 하나를 받아
 *           1) 구글 드라이브 "aprism-ut-records" 폴더에 <기록ID>.json 으로 저장(있으면 덮어씀, 판(rev)이 더 새로울 때만)
 *              — 불러오기, 저장 확인은 이 파일로 한다(시트는 읽지 않는다)
 *           2) 이 시트의 "응답" 탭에 참가자 한 줄. 열은 사이트가 보낸 것(요약 CSV 와 같다): 참가자, 기록ID, 기본정보,
 *              단계별 시간, 선호 화면, 7점 척도, 주관식, 시나리오 인터뷰 답. 같은 기록ID 줄이 있으면 덮어쓴다
 *   doGet   action=has&id=…   그 기록의 저장된 판(rev)을 알려 준다(사이트가 저장됐는지 확인)
 *           action=del&id=…   그 기록을 지운다(드라이브 파일은 휴지통, 응답 탭 줄 삭제)
 *           action=list        저장된 기록 전부를 돌려준다(사이트 기록 화면, 리포트가 노트북 4대 기록을 합칠 때)
 *
 * 노트북 여러 대가 동시에 보내도 잠금(LockService)으로 하나씩 처리한다.
 */
var FOLDER_NAME = "aprism-ut-records";
var SHEET_NAME = "응답";

function folder_() {
  var it = DriveApp.getFoldersByName(FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
}

function storedRev_(file) {
  try { return JSON.parse(file.getBlob().getDataAsString()).rev || 0; } catch (e) { return 0; }
}

// 응답 탭 — 머리줄은 사이트가 보낸 것으로 맞추고, 기록ID 로 줄을 찾아 덮어쓴다
function writeRow_(head, row) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  head = ["마지막 저장"].concat(head); row = [new Date()].concat(row);
  var cur = sh.getLastRow() ? sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0] : [];
  if (cur.join("\u0001") !== head.join("\u0001")) { sh.getRange(1, 1, 1, head.length).setValues([head]); sh.setFrozenRows(1); }
  var idCol = head.indexOf("기록ID") + 1, id = row[idCol - 1], hit = null;
  if (idCol > 0 && sh.getLastRow() > 1) { hit = sh.getRange(2, idCol, sh.getLastRow() - 1, 1).createTextFinder(String(id)).matchEntireCell(true).findNext(); }
  var cells = [row.map(function (v) { return v == null ? "" : v; })];
  if (hit) { sh.getRange(hit.getRow(), 1, 1, row.length).setValues(cells); } else { sh.getRange(sh.getLastRow() + 1, 1, 1, row.length).setValues(cells); }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var body = JSON.parse(e.postData.contents);
    var a = body.attempt;
    if (!a || !a.id) { return out_({ ok: false }); }
    a.rev = body.rev || a.rev || 0;
    var name = a.id + ".json", f = folder_(), it = f.getFilesByName(name), file;
    if (it.hasNext()) {
      file = it.next();
      if (storedRev_(file) > a.rev) { return out_({ ok: true, kept: true }); }   // 더 새 판이 이미 있으면 그대로
      file.setContent(JSON.stringify(a));
    } else {
      file = f.createFile(name, JSON.stringify(a), "application/json");
    }
    if (body.sheet && body.sheet.head && body.sheet.row) { writeRow_(body.sheet.head, body.sheet.row); }
    return out_({ ok: true, rev: a.rev });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  var p = e.parameter || {}, data;
  if (p.action === "has") {
    var it = folder_().getFilesByName(p.id + ".json");
    data = { rev: it.hasNext() ? storedRev_(it.next()) : 0 };
  } else if (p.action === "del" && p.id) {
    // 기록 지우기 — 드라이브 파일은 휴지통으로, 응답 탭의 그 줄은 삭제
    var lock = LockService.getScriptLock(); lock.waitLock(30000);
    try {
      var fi = folder_().getFilesByName(p.id + ".json"), n = 0;
      while (fi.hasNext()) { fi.next().setTrashed(true); n++; }
      var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
      if (sh && sh.getLastRow() > 1) {
        var head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0], col = head.indexOf("기록ID") + 1;
        if (col > 0) { var hit = sh.getRange(2, col, sh.getLastRow() - 1, 1).createTextFinder(String(p.id)).matchEntireCell(true).findNext(); if (hit) { sh.deleteRow(hit.getRow()); } }
      }
      data = { ok: true, trashed: n };
    } finally { lock.releaseLock(); }
  } else if (p.action === "list") {
    var files = folder_().getFiles(), list = [];
    while (files.hasNext()) { try { list.push(JSON.parse(files.next().getBlob().getDataAsString())); } catch (x) { } }
    data = { attempts: list };
  } else {
    data = { ok: true, name: "aprism-ut-backup" };
  }
  // JSONP — 사이트가 다른 주소(github.io)라서 script 태그로 받는다
  if (p.callback && /^[\w$.]+$/.test(p.callback)) {
    return ContentService.createTextOutput(p.callback + "(" + JSON.stringify(data) + ");").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return out_(data);
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
