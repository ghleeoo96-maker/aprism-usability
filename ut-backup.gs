/**
 * 에이프리즘 사용성 평가 — 온라인 백업(구글 시트에 붙이는 Apps Script)
 *
 * 하는 일
 *   doPost  사이트가 보낸 참가자 기록 하나를 받아
 *           1) 구글 드라이브 "aprism-ut-records" 폴더에 <기록ID>.json 으로 저장(있으면 덮어씀, 판(rev)이 더 새로울 때만)
 *           2) 이 시트의 "기록" 탭에 한 줄 요약(참가자, 상태, 시나리오 시간 등)
 *   doGet   action=has&id=…   그 기록의 저장된 판(rev)을 알려 준다(사이트가 저장됐는지 확인)
 *           action=list        저장된 기록 전부를 돌려준다(사이트 기록 화면의 [구글 시트에서 불러오기])
 *
 * 노트북 여러 대가 동시에 보내도 잠금(LockService)으로 하나씩 처리한다.
 */
var FOLDER_NAME = "aprism-ut-records";
var SHEET_NAME = "기록";
var HEAD = ["기록ID", "참가자", "판(rev)", "마지막 저장", "상태", "성별", "연령대", "담당 업무",
  "S1 수행(초)", "S2 수행(초)", "S3 수행(초)", "선호 화면 모드", "드라이브 파일"];

function folder_() {
  var it = DriveApp.getFoldersByName(FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) { sh.appendRow(HEAD); sh.setFrozenRows(1); }
  return sh;
}

function storedRev_(file) {
  try { return JSON.parse(file.getBlob().getDataAsString()).rev || 0; } catch (e) { return 0; }
}

function sec_(s) { return s && s.start && s.done ? Math.round((s.done - s.start) / 1000) : ""; }

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
    var p = a.profile || {}, sc = a.scenarios || {};
    var state = a.stopped ? "중단" : (a.post ? "완료" : "진행 중");
    var row = [a.id, a.participant, a.rev, new Date(), state, p.gender || "", p.age || "", p.job || "",
      sec_(sc[1]), sec_(sc[2]), sec_(sc[3]), a.post ? (a.post.mode || "") : "", file.getUrl()];
    var sh = sheet_(), hit = sh.getRange("A:A").createTextFinder(a.id).matchEntireCell(true).findNext();
    if (hit) { sh.getRange(hit.getRow(), 1, 1, row.length).setValues([row]); } else { sh.appendRow(row); }
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
