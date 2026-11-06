/*
 * 결과 리포트 — index.html 의 기록(window.UT)으로 그린다. 주소 #report(실제 기록) · #report-sample(가짜 16명).
 *   1 요약 숫자   완료 인원, 시나리오별 수행 시간 중앙값, 시나리오 3 조치 실행 인원
 *   2 수행 시간   시나리오마다 참가자 16명 점 + 중앙값 눈금
 *   3 누른 곳     시나리오마다 영역별 "누른 참가자 수"
 *   4 알림 반응   시나리오 2 알림 뒤 처음 누른 곳, 알림 확인까지 걸린 시간, 알림 상세를 연 경로와 시간
 *   5 막힌 신호   빈 링크, 조치 버튼 안 누름, 중앙값 2배 넘김
 *   6 참가자별 표 · 7 공통질문(인터뷰 답변은 구두라 리포트에서 뺐다)
 * 색은 한 가지(파랑) — 시나리오는 행으로 나눠 색으로 구분하지 않는다. 글자는 글자색, 값은 tabular-nums.
 */
(function () {
  "use strict";
  var U = window.UT;
  if (!U) { return; }

  var css = document.createElement("style");
  css.textContent = [
    ".rp { --rp-blue: #2a78d6; --rp-blue-weak: #cde2fb; --rp-ink: #16191f; --rp-ink-2: #4a5160; --rp-ink-3: #8a919e; --rp-line: #e3e7ec; --rp-crit: #d03b3b; max-width: 1280px; }",
    ".rp-head { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; }",
    ".rp-head h1 { flex: 1; }",
    ".rp-badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 14px; font-weight: 700; background: #fff4d6; color: #8a5a00; margin-left: 12px; vertical-align: middle; }",
    ".rp-meta { color: var(--rp-ink-2); font-size: 15px; margin-top: 8px; }",
    ".rp-sec { margin-top: 40px; }",
    ".rp-sec > h2 { margin: 0 0 4px; font-size: 22px; font-weight: 800; }",
    ".rp-sec > .rp-sub { margin: 0 0 16px; color: var(--rp-ink-2); font-size: 15px; }",
    ".rp-card { background: #fff; border-radius: 14px; padding: 20px 24px; }",
    ".rp-tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }",
    ".rp-tile { background: #fff; border-radius: 14px; padding: 18px 20px; }",
    ".rp-tile .k { font-size: 15px; color: var(--rp-ink-2); }",
    ".rp-tile .v { font-size: 34px; font-weight: 800; margin-top: 6px; letter-spacing: -0.01em; }",
    ".rp-tile .v small { font-size: 18px; font-weight: 700; color: var(--rp-ink-2); margin-left: 4px; }",
    ".rp-tile .s { font-size: 14px; color: var(--rp-ink-3); margin-top: 4px; }",
    ".rp-grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }",
    ".rp-grid2 { display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; }",
    ".rp-card h3 { margin: 0 0 12px; font-size: 17px; font-weight: 800; }",
    ".rp-bars { display: grid; gap: 8px; }",
    ".rp-bar { display: grid; grid-template-columns: 132px 1fr 56px; align-items: center; gap: 10px; font-size: 14px; }",
    ".rp-bar .l { color: var(--rp-ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }",
    ".rp-bar .t { height: 14px; background: #f1f3f6; border-radius: 4px; position: relative; }",
    ".rp-bar .f { position: absolute; left: 0; top: 0; bottom: 0; background: var(--rp-blue); border-radius: 0 4px 4px 0; }",
    ".rp-bar .n { text-align: right; color: var(--rp-ink); font-weight: 700; }",
    ".rp-bar:hover .f { filter: brightness(1.1); }",
    ".rp-flags { display: grid; gap: 10px; }",
    ".rp-flag { display: grid; grid-template-columns: 56px 1fr; gap: 14px; align-items: start; padding: 12px 0; border-top: 1px solid var(--rp-line); }",
    ".rp-flag:first-child { border-top: 0; }",
    ".rp-flag .c { font-size: 26px; font-weight: 800; text-align: right; }",
    ".rp-flag .c small { font-size: 14px; color: var(--rp-ink-3); font-weight: 600; }",
    ".rp-flag b { display: block; font-size: 16px; }",
    ".rp-flag span { font-size: 14px; color: var(--rp-ink-2); }",
    ".rp-tbl { width: 100%; border-collapse: collapse; font-size: 14px; background: #fff; }",
    ".rp-tbl th, .rp-tbl td { padding: 8px 10px; border-bottom: 1px solid var(--rp-line); text-align: left; white-space: nowrap; }",
    ".rp-tbl th { color: var(--rp-ink-2); font-weight: 700; background: #f6f8fb; }",
    ".rp-tbl td.num, .rp-tbl th.num { text-align: right; }",
    ".rp-tbl td.slow { color: var(--rp-crit); font-weight: 700; }",
    ".rp-qa details { background: #fff; border-radius: 12px; margin-top: 8px; }",
    ".rp-qa summary { cursor: pointer; padding: 14px 18px; font-size: 16px; font-weight: 700; list-style: none; display: flex; gap: 10px; }",
    ".rp-qa summary::before { content: '▸'; color: var(--rp-ink-3); }",
    ".rp-qa details[open] summary::before { content: '▾'; }",
    ".rp-qa summary em { font-style: normal; color: var(--rp-blue); }",
    ".rp-qa ul { margin: 0; padding: 0 18px 14px 46px; display: grid; gap: 6px; font-size: 15px; }",
    ".rp-qa li { list-style: none; display: grid; grid-template-columns: 44px 1fr; gap: 8px; }",
    ".rp-qa li b { color: var(--rp-ink-3); font-weight: 700; }",
    ".rp-tip { position: fixed; z-index: 100; pointer-events: none; background: #16191f; color: #fff; font-size: 14px; padding: 8px 10px; border-radius: 8px; line-height: 1.5; box-shadow: 0 6px 16px rgba(0,0,0,.25); }",
    ".rp-legend { display: flex; gap: 16px; font-size: 14px; color: var(--rp-ink-2); margin-top: 8px; }",
    ".rp-legend i { display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: var(--rp-blue); margin-right: 6px; vertical-align: 0; }",
    ".rp-legend i.med { width: 3px; height: 14px; border-radius: 1px; background: var(--rp-ink); vertical-align: -2px; }",
    ".rp-empty { color: var(--rp-ink-3); font-size: 15px; }",
    ".rp-view { display: flex; gap: 4px; margin-top: 20px; border-bottom: 2px solid var(--rp-line); }",
    ".rp-view button { border: 0; background: none; padding: 10px 18px; font-size: 17px; font-weight: 800; color: var(--rp-ink-3); border-bottom: 3px solid transparent; margin-bottom: -2px; }",
    ".rp-view button[aria-selected='true'] { color: var(--rp-ink); border-bottom-color: var(--rp-blue); }",
    ".one-nav { display: flex; align-items: center; gap: 10px; margin-top: 20px; }",
    ".one-nav button { width: 40px; height: 40px; border: 1px solid var(--rp-line); border-radius: 10px; background: #fff; font-size: 22px; line-height: 1; }",
    ".one-nav button:disabled { opacity: .35; cursor: default; }",
    ".one-nav select { font: inherit; font-size: 16px; font-weight: 800; padding: 8px 10px; border: 1px solid var(--rp-line); border-radius: 10px; background: #fff; }",
    ".one-nav span { font-size: 16px; color: var(--rp-ink-2); }",
    ".one-info { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }",
    ".one-info div { background: #fff; border-radius: 10px; padding: 12px 14px; }",
    ".one-info span { display: block; font-size: 14px; color: var(--rp-ink-3); }",
    ".one-info b { font-size: 16px; }",
    ".one-scn { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: start; }",
    ".one-maps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }",
    ".one-lks { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }",
    ".one-lk { display: flex; justify-content: space-between; align-items: center; background: #f6f8fb; border-radius: 8px; padding: 10px 12px; font-size: 15px; }",
    ".one-lk b { font-size: 18px; }",
    ".rp-tbl td.wrap { white-space: normal; }",
    ".pp { display: grid; gap: 2px; }",
    ".pp-row { display: grid; grid-template-columns: 56px repeat(3, 1fr); gap: 24px; align-items: center; min-height: 30px; }",
    ".pp-head { font-size: 14px; color: var(--rp-ink-2); padding-bottom: 8px; border-bottom: 1px solid var(--rp-line); margin-bottom: 6px; }",
    ".pp-head b { color: var(--rp-ink); }",
    ".pp-head em { font-style: normal; float: right; color: var(--rp-ink); font-weight: 700; }",
    ".pp-p { font-weight: 800; font-size: 15px; }",
    ".pp-cell { display: grid; grid-template-columns: 1fr 52px; gap: 8px; align-items: center; }",
    ".pp-track { position: relative; height: 16px; }",
    ".pp-bar { position: absolute; left: 0; top: 0; bottom: 0; background: var(--rp-blue); border-radius: 0 4px 4px 0; }",
    ".pp-cell:hover .pp-bar { filter: brightness(1.12); }",
    ".pp-med { position: absolute; top: -4px; bottom: -4px; border-left: 2px dotted var(--rp-ink); }",
    ".pp-v { text-align: right; font-size: 15px; font-weight: 700; }",
    ".pp-v.is-slow { color: var(--rp-crit); }",
    ".rp-legend i.bar { width: 16px; height: 10px; border-radius: 0 3px 3px 0; }",
    ".rp-legend i.med2 { width: 0; height: 14px; border-radius: 0; background: none; border-left: 2px dotted var(--rp-ink); vertical-align: -2px; }",
    ".lk { display: grid; gap: 4px; }",
    ".lk-row { display: grid; grid-template-columns: 1fr repeat(7, 44px) 56px; gap: 4px; align-items: center; }",
    ".lk-h { font-size: 14px; color: var(--rp-ink-2); text-align: center; }",
    ".lk-h span:first-child { text-align: left; }",
    ".lk-q { font-size: 14px; color: var(--rp-ink-2); padding-right: 12px; line-height: 1.4; }",
    ".lk-q b { color: var(--rp-ink); }",
    ".lk-q .k { color: var(--rp-ink); margin-right: 6px; }",
    ".lk-c { height: 36px; border-radius: 6px; display: grid; place-items: center; font-size: 15px; font-weight: 700; }",
    ".lk-m { text-align: right; font-size: 18px; font-weight: 800; }",
    ".rp-legend i.ring { background: #fff; box-shadow: inset 0 0 0 2px var(--rp-blue); }",
    ".cm-tabs { display: flex; gap: 6px; margin-bottom: 16px; }",
    ".cm-tabs button { border: 0; border-radius: 999px; padding: 8px 16px; background: #edf0f4; color: var(--rp-ink-2); font-size: 15px; font-weight: 700; }",
    ".cm-tabs button[aria-selected='true'] { background: var(--rp-ink); color: #fff; }",
    ".cm-main { display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start; }",
    ".cm-cap { margin: 0 0 8px; font-size: 15px; color: var(--rp-ink-2); }",
    ".cm-cap b { color: var(--rp-ink); }",
    ".cm-scr { position: relative; aspect-ratio: 16 / 9; border-radius: 8px; overflow: hidden; background: #0b0d12; }",
    ".cm-scr img { position: absolute; inset: 0; width: 100%; height: 100%; opacity: .55; }",
    ".cm-scr svg { position: absolute; inset: 0; width: 100%; height: 100%; }",
    ".cm-off { margin: 6px 0 0; font-size: 14px; color: var(--rp-ink-3); }",
    ".cm-pick { display: grid; gap: 8px; }",
    ".cm-pick button { border: 1px solid var(--rp-line); background: #fff; border-radius: 10px; padding: 8px 6px; font-size: 14px; }",
    ".cm-pick button[aria-pressed='true'] { border-color: var(--rp-blue); background: #e7eefa; }",
    ".cm-pick button:disabled { opacity: .4; cursor: default; }",
    ".cm-all { font-weight: 800; }",
    ".cm-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }",
    ".cm-grid button { display: grid; gap: 2px; }",
    ".cm-grid b { font-size: 15px; }",
    ".cm-grid span { color: var(--rp-ink-3); }",
    ".cm-h { margin: 28px 0 10px; font-size: 17px; font-weight: 800; }",
    ".cm-thumbs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }",
    ".cm-thumb { border: 2px solid transparent; background: none; padding: 0; border-radius: 10px; text-align: left; }",
    ".cm-thumb[aria-pressed='true'] { border-color: var(--rp-blue); }",
    ".cm-thumb span { display: block; padding: 6px 4px 2px; font-size: 14px; color: var(--rp-ink-2); }",
    ".cm-thumb span b { color: var(--rp-ink); margin-right: 4px; }",
    "@media print { .rp-noprint { display: none !important; } .page { padding: 24px; } }"
  ].join("\n");
  document.head.appendChild(css);

  var sec = document.createElement("section");
  sec.className = "page";
  sec.id = "report";
  sec.hidden = true;
  document.body.insertBefore(sec, document.getElementById("test"));
  var tip = document.createElement("div");
  tip.className = "rp-tip"; tip.hidden = true;
  document.body.appendChild(tip);

  // 클릭 지도 배경 — 시나리오 1은 주의 쌓인 판, 2와 3은 위험 알림 상세가 열린 판(img/rects.json 과 같은 때 찍음)
  var BG = { 1: "img/s1.jpg", 2: "img/s2.jpg", 3: "img/s2.jpg" };
  var RECTS = {"s1":{"미션 탭":[76,0,1257,52],"GNB":[0,52,76,1028],"Delta":[416,60,260,260],"최신 알림":[76,141,340,469],"오늘 확인 완료":[76,610,340,470],"지도 도구":[1508,80,44,286],"설비 배치도":[436,80,1116,972],"미션 진행률":[1576,288,312,94],"미션 진행 지점 목록":[1576,424,312,624],"로봇 정보":[1576,84,312,204],"_gnb":{"관제":[3,60,70,64],"안전진단":[3,128,70,64],"로봇":[3,196,70,64],"AI":[3,264,70,64],"스케줄러":[3,332,70,64],"Delta":[3,400,70,64],"보고서":[3,468,70,64],"계정관리":[3,536,70,64],"환경설정":[3,996,70,64]}},"s2":{"미션 탭":[76,0,1257,52],"GNB":[0,52,76,1028],"Delta":[416,60,260,260],"최신 알림":[76,141,340,469],"오늘 확인 완료":[76,610,340,470],"지도 도구":[1508,80,44,286],"설비 배치도":[436,80,1116,972],"미션 진행률":[1576,288,312,94],"미션 진행 지점 목록":[1576,424,312,624],"로봇 정보":[1576,84,312,204],"알림 상세":[809,234,370,561],"알림 상세 Delta":[818,518,352,212],"조치 버튼":[1092,750,74,32],"_gnb":{"관제":[3,60,70,64],"안전진단":[3,128,70,64],"로봇":[3,196,70,64],"AI":[3,264,70,64],"스케줄러":[3,332,70,64],"Delta":[3,400,70,64],"보고서":[3,468,70,64],"계정관리":[3,536,70,64],"환경설정":[3,996,70,64]}}};

  var esc = U.esc;
  // 리포트의 시간은 초로 — "76초"
  function mmss(ms) { return ms == null || isNaN(ms) ? "" : Math.round(ms / 1000) + "초"; }
  function median(a) { if (!a.length) { return null; } var s = a.slice().sort(function (x, y) { return x - y; }), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }

  // ================================================================
  // 샘플 기록 — 실제 기록과 같은 모양. 같은 씨앗이면 늘 같은 결과
  // ================================================================
  function sample() {
    var seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    function pick(a) { return a[Math.floor(rnd() * a.length)]; }
    function logn(med, spread) { var u = rnd() + rnd() + rnd() - 1.5; return Math.round(med * Math.exp(u * spread)); }
    var ANS = {
      "1-1": [["정기 순회 점검", "B4 정기 순회 점검", "정기 순회 점검 같다(탭 이름 보고)", "순회 점검", "잘 모르겠다, 미션이 여러 개라 헷갈림"],
              ["8번", "8번 냉각수 열교환기", "8번에서 측정 중", "7번", "지도에서 번호를 못 찾음"]],
      "1-2": [["35%", "35%, 7/20 지점", "약 3분의 1", "35%인데 시간이 1시간 57분 남았다고 나옴"],
              ["8번 지점으로 이동 중", "냉각수 열교환기 판독 중", "측정하고 있는 것 같다", "이동 중"],
              ["오른쪽 진행 막대", "지점 목록의 '이동 중' 표시", "지도 위 로봇 위치", "오른쪽 위 냉각수 열교환기 HX-1 판독 글자"]],
      "2-1": [["N₂ 배관 압력계 압력이 기준보다 높다", "계기인식 압력 0.86 MPa", "압력 이상", "가스 누출 같은 것"]],
      "2-2": [["B4 WP-04", "지하 4층 N₂ 배관 압력계", "4번 지점", "B4 터빈 2"],
              ["위험, 바로 조치가 필요하다", "높다", "주의 정도", "매우 위험"],
              ["빨간색이라서", "[화면] 알림 상세 '위험'", "기준 0.80보다 높은 값을 봐서", "Delta가 빨개져서"]],
      "2-3": [["Delta가 빨개진 것", "왼쪽 알림 목록", "화면 테두리가 빨개짐", "지도 위 빨간 핀"],
              ["측정값", "위치", "사진", "Delta 조치 제안"],
              ["6", "5", "3", "7", "4"],
              ["예", "예", "아니오"]],
      "3-1": [["예", "예", "예", "아니오"]],
      "3-2": [["알림이 목록에서 사라졌다", "오늘 확인 완료로 옮겨졌다", "화면 아래 안내 문구", "잘 모르겠다, 반영됐는지 확신이 없다"]]
    };
    var AREA = {
      s1: [["미션 진행 지점 목록", 0.8], ["미션 진행률", 0.6], ["설비 배치도", 0.7], ["로봇 정보", 0.5], ["미션 탭", 0.45], ["Delta", 0.3], ["최신 알림", 0.25], ["GNB", 0.15]],
      s2: [["최신 알림", 0.9], ["알림 상세", 0.85], ["Delta", 0.55], ["설비 배치도", 0.45], ["라이브 뷰 크게보기", 0.3], ["미션 탭", 0.15]],
      s3: [["알림 상세", 0.9], ["최신 알림", 0.6], ["알림 상세 Delta", 0.4], ["Delta", 0.35], ["로봇 정보", 0.2], ["오늘 확인 완료", 0.35]]
    };
    var FIRST = [["최신 알림", 9], ["Delta", 4], ["설비 배치도", 2], ["미션 탭", 1]];
    var DEADS = ["로봇", "AI", "스케줄러", "Delta", "계정관리"];
    // 영역 안 한 점 — 가운데 쪽으로 조금 모인다
    function spot(ph, e) {
      var R = ph === "s1" ? RECTS.s1 : RECTS.s2, r;
      if (e.dead) { r = RECTS.s1._gnb[e.label]; }
      else if (e.confirm) { r = R["조치 버튼"]; }
      else if (e.area === "라이브 뷰 크게보기") { r = [809, 292, 370, 226]; }
      else { r = R[e.area] || R["설비 배치도"]; }
      function c(a, w) { return Math.round(a + w * (0.15 + 0.7 * (rnd() + rnd()) / 2)); }
      return [c(r[0], r[2]), c(r[1], r[3])];
    }
    var out = [], base = Date.parse("2026-11-10T10:00:00+09:00");
    for (var i = 1; i <= 16; i++) {
      var p = U.pid(i), t0 = base + (i - 1) * 40 * 60000, t = t0, ev = [];
      var a = { id: p + "-sample", participant: p, startedAt: t0, endedAt: null, tutorial: {}, scenarios: {}, events: ev, sample: true,
        profile: { consent: "동의", gender: pick(["남", "남", "남", "여"]), age: pick(["26-35세", "26-35세", "36-45세", "36-45세", "46-55세", "56-65세"]),
          job: pick(["관제, 운영", "관제, 운영", "안전관리", "안전관리", "시설, 설비관리", "로봇, 시스템 개발", "기타: 품질관리"]) } };
      function push(phase, stage, type, extra) { var e = { t: t, at: t - t0, phase: phase, stage: stage, task: "", type: type }; for (var k in extra || {}) { e[k] = extra[k]; } if (type === "click") { var xy = spot(phase, e); e.x = xy[0]; e.y = xy[1]; e.page = "main-v6.html"; } ev.push(e); }
      a.tutorial.start = t; t += logn(70, 0.5) * 1000; a.tutorial.end = t; a.tutorial.skipped = i === 5 || i === 12 ? "2/6" : "";
      [1, 2, 3].forEach(function (n) {
        var ph = "s" + n, s = a.scenarios[n] = { start: 0, done: 0, end: 0, tasks: {} };
        t += 15000; s.start = t; push(ph, "intro", "scenario-start");
        var runMs = logn([0, 72, 58, 85][n], 0.6) * 1000;
        if (n === 3 && (i === 4 || i === 11)) { runMs = 260000 + rnd() * 60000; }   // 조치 버튼을 못 찾은 두 명
        var end = t + runMs;
        if (n === 2) { t += 3000; push(ph, "run", "alert-in", { label: "새 위험 알림 발생" }); var dOpen = logn(14, 0.6) * 1000; (function (tt) { var ev0 = { t: tt, at: tt - t0, phase: ph, stage: "run", task: "", type: "detail-open", area: pick(["최신 알림", "최신 알림", "최신 알림", "설비 배치도", "Delta"]), ms: dOpen }; ev.push(ev0); })(t + dOpen); var f = FIRST[Math.min(3, Math.floor(rnd() * 16) < 9 ? 0 : Math.floor(rnd() * 16) < 4 ? 1 : Math.floor(rnd() * 3) + 1)]; t += logn(9, 0.6) * 1000; push(ph, "run", "click", { area: f[0], label: f[0] }); }
        AREA[ph].forEach(function (ar) {
          if (rnd() < ar[1]) { var c = 1 + Math.floor(rnd() * 3); for (var k = 0; k < c; k++) { t = Math.min(end - 1000, t + rnd() * runMs / 6); push(ph, "run", "click", { area: ar[0], label: ar[0] }); } }
        });
        if (n === 1 && rnd() < 0.3) { push(ph, "run", "click", { area: "GNB", label: pick(DEADS), dead: 1 }); }
        if (n === 3 && i !== 11) { t = Math.min(end - 2000, t + 2000); push(ph, "run", "click", { area: "알림 상세", label: "조치 요청", confirm: 1 }); }
        t = end; s.done = t; push(ph, "run", "run-done");
        U.SCEN[n - 1].tasks.forEach(function (tk) {
          var st = s.tasks[tk.id] = { start: t, end: 0, answers: [] };
          ANS[tk.id].forEach(function (opts) { st.answers.push(pick(opts)); t += logn(18, 0.5) * 1000; });
          st.end = t;
        });
        s.end = t;
      });
      var OPA = [["지점 번호가 작아 처음엔 못 찾았다", "특별히 없었다", "미션 탭이 많아 어느 게 지금 것인지 헷갈렸다"],
        ["빨간 색과 Delta 문구", "압력 수치 0.86", "지도 위 빨간 핀"],
        ["빨간색이라 급하다고 느꼈다", "Delta가 먼저 알려 줘서 긴급하다고 느꼈다", "별로 긴급해 보이지 않았다"],
        ["색으로 바로 구분됐다", "둘 다 삼각형이라 차이가 잘 안 보였다", "위험은 Delta가 빨개져서 달랐다"],
        ["조치 항목이 무엇을 뜻하는지 망설였다", "없었다", "[조치 요청]과 [진단 상세] 중 무엇을 눌러야 할지 고민했다"],
        ["현장 작업자 위치", "조치 이력", "알림 소리"],
        ["Delta 요약이 유용, 지도 번호는 개선 필요", "알림 상세가 유용, 글씨 크기 개선", "한눈에 보이는 진행률이 유용"],
        ["", "전체적으로 깔끔하다", ""]];
      a.post = { open: OPA.map(function (o) { return pick(o); }), mode: pick(["블랙 모드", "블랙 모드", "화이트 모드", "상관없다", ""]), likert: [5, 4, 4, 5, 5, 3, 5, 6, 5, 5].map(function (m) { return Math.max(1, Math.min(7, m + Math.round((rnd() + rnd() - 1) * 2))); }), start: t, answeredAt: t + 120000 };
      a.endedAt = t;
      out.push(a);
    }
    return { attempts: out };
  }

  // ================================================================
  // 계산
  // ================================================================
  function build(db) {
    var people = [];
    for (var i = 1; i <= U.PEOPLE; i++) {
      var p = U.pid(i), list = db.attempts.filter(function (x) { return x.participant === p; });
      if (list.length) { people.push(list[list.length - 1]); }
    }
    var S = [1, 2, 3].map(function (n) {
      var ph = "s" + n, rows = people.map(function (a) { return { p: a.participant, st: U.scenStat(a, n), a: a }; }).filter(function (r) { return r.st.ms != null; });
      var areas = {};
      rows.forEach(function (r) {
        var seen = {};
        r.a.events.forEach(function (e) { if (e.phase === ph && e.type === "click" && e.stage === "run" && e.area && !seen[e.area]) { seen[e.area] = 1; areas[e.area] = (areas[e.area] || 0) + 1; } });
      });
      var ms = rows.map(function (r) { return r.st.ms; });
      return { n: n, rows: rows, med: median(ms), min: Math.min.apply(null, ms), max: Math.max.apply(null, ms), areas: areas };
    });
    // 시나리오 2 — 알림 뒤 처음 누른 곳, 알림 확인(최신 알림 또는 알림 상세를 처음 누름)까지
    var first = {}, react = [], via = {}, opens = [];
    people.forEach(function (a) { var d = a.events.filter(function (e) { return e.phase === "s2" && e.type === "detail-open"; })[0]; if (d) { via[d.area || "기타"] = (via[d.area || "기타"] || 0) + 1; opens.push(d.ms); } });
    people.forEach(function (a) {
      var ai = a.events.filter(function (e) { return e.phase === "s2" && e.type === "alert-in"; })[0];
      if (!ai) { return; }
      var after = a.events.filter(function (e) { return e.phase === "s2" && e.type === "click" && e.t >= ai.t; });
      if (after[0]) { first[after[0].area || "기타"] = (first[after[0].area || "기타"] || 0) + 1; }
      var hit = after.filter(function (e) { return e.area === "최신 알림" || e.area === "알림 상세"; })[0];
      if (hit) { react.push({ p: a.participant, ms: hit.t - ai.t }); }
    });
    // 막힌 신호
    var early = people.filter(function (a) { return a.events.some(function (e) { return e.type === "s2-early-action"; }); });
    var dead = people.filter(function (a) { return a.events.some(function (e) { return e.dead; }); });
    var deadMenus = {};
    people.forEach(function (a) { a.events.forEach(function (e) { if (e.dead) { deadMenus[e.label] = (deadMenus[e.label] || 0) + 1; } }); });
    var s3 = people.filter(function (a) { return a.scenarios[3] && a.scenarios[3].done; });
    var noConfirm = s3.filter(function (a) { return !a.events.some(function (e) { return e.phase === "s3" && e.confirm; }); });
    var slow = [];
    S.forEach(function (s) { s.rows.forEach(function (r) { if (s.med && r.st.ms > s.med * 2) { slow.push(r.p + " 시나리오 " + s.n); } }); });
    return { early: early, people: people, S: S, first: first, react: react, via: via, opens: opens, dead: dead, deadMenus: deadMenus, s3: s3, noConfirm: noConfirm, slow: slow };
  }

  // ================================================================
  // 그리기
  // ================================================================
  function tiles(R) {
    var done = R.people.filter(U.doneAll).length;
    function t(k, v, s) { return '<div class="rp-tile"><div class="k">' + k + '</div><div class="v">' + v + '</div><div class="s">' + s + "</div></div>"; }
    var h = t("완료한 참가자", done + "<small>/ " + U.PEOPLE + "명</small>", "기록 있는 참가자 " + R.people.length + "명");
    R.S.forEach(function (s) {
      h += t("시나리오 " + s.n + " 수행 시간(중앙값)", s.med != null ? mmss(s.med) : "-", s.rows.length ? "가장 빠름 " + mmss(s.min) + ", 가장 느림 " + mmss(s.max) : "기록 없음");
    });
    return '<div class="rp-tiles">' + h + "</div>";
  }

  // 수행 시간 — 참가자 한 줄에 시나리오 셋. 막대 길이는 세 칸 모두 같은 눈금(가장 오래 걸린 시간 = 칸 끝)
  //   칸마다 그 시나리오 중앙값을 세로 점선으로. 중앙값 2배를 넘으면 숫자를 굵은 빨강
  function perPerson(R) {
    var max = 0;
    R.S.forEach(function (s) { s.rows.forEach(function (r) { max = Math.max(max, r.st.ms); }); });
    if (!max) { return '<p class="rp-empty">기록 없음</p>'; }
    var h = '<div class="pp"><div class="pp-row pp-head"><span></span>' + R.S.map(function (s) {
      return '<span><b>시나리오 ' + s.n + '</b> ' + esc(U.SCEN[s.n - 1].title) + '<em>중앙 ' + mmss(s.med) + '</em></span>';
    }).join('') + '</div>';
    R.people.forEach(function (a) {
      h += '<div class="pp-row"><span class="pp-p">' + a.participant + '</span>' + R.S.map(function (s) {
        var st = U.scenStat(a, s.n), w = st.ms != null ? st.ms / max * 100 : 0, slow = s.med && st.ms > s.med * 2;
        var tipText = a.participant + '  시나리오 ' + s.n + '  ' + mmss(st.ms) + '  클릭 ' + st.clicks + '회';
        return '<span class="pp-cell"' + (st.ms != null ? ' data-tip="' + esc(tipText) + '"' : '') + '><span class="pp-track">' +
          (st.ms != null ? '<span class="pp-bar" style="width:' + w + '%"></span>' : '') +
          (s.med ? '<span class="pp-med" style="left:' + (s.med / max * 100) + '%"></span>' : '') +
          '</span><span class="pp-v' + (slow ? ' is-slow' : '') + '">' + (st.ms != null ? mmss(st.ms) : '-') + '</span></span>';
      }).join('') + '</div>';
    });
    return h + '</div><div class="rp-legend"><span><i class="bar"></i>걸린 시간</span><span><i class="med2"></i>그 시나리오 중앙값</span><span>빨간 숫자는 중앙값의 2배를 넘은 것</span></div>';
  }

  function bars(map, total, max) {
    var keys = Object.keys(map).sort(function (a, b) { return map[b] - map[a]; });
    if (!keys.length) { return '<p class="rp-empty">기록 없음</p>'; }
    var shown = keys.slice(0, max || 7), rest = keys.slice(max || 7);
    var items = shown.map(function (k) { return [k, map[k]]; });
    if (rest.length) { items.push(["기타 " + rest.length + "곳", rest.reduce(function (s, k) { return s + map[k]; }, 0)]); }
    return '<div class="rp-bars">' + items.map(function (it) {
      var w = total ? it[1] / total * 100 : 0;
      return '<div class="rp-bar" data-tip="' + esc(it[0] + "  " + it[1] + "명 / " + total + "명") + '"><span class="l">' + esc(it[0]) + '</span><span class="t"><span class="f" style="width:' + w + '%"></span></span><span class="n">' + it[1] + "명</span></div>";
    }).join("") + "</div>";
  }

  function flags(R) {
    var dm = Object.keys(R.deadMenus).sort(function (a, b) { return R.deadMenus[b] - R.deadMenus[a]; }).map(function (k) { return k + " " + R.deadMenus[k] + "회"; }).join(", ");
    function f(c, of, title, body) { return '<div class="rp-flag"><div class="c">' + c + "<small>/" + of + '</small></div><div><b>' + title + "</b><span>" + body + "</span></div></div>"; }
    return '<div class="rp-flags">' +
      f(R.noConfirm.length, R.s3.length, "시나리오 3에서 조치 버튼을 누르지 않고 끝냄", R.noConfirm.length ? R.noConfirm.map(function (a) { return a.participant; }).join(", ") : "없음") +
      f(R.early.length, R.people.length, "시나리오 2(확인만)에서 미리 조치 버튼을 누름", R.early.length ? R.early.map(function (a) { return a.participant; }).join(", ") : "없음") +
      f(R.dead.length, R.people.length, "연결 안 된 메뉴(빈 링크)를 누름", dm || "없음") +
      f(R.slow.length, R.people.length * 3, "수행 시간이 중앙값의 2배를 넘음", R.slow.join(", ") || "없음") +
      "</div>";
  }

  // 참가자 구성 — 성별, 연령대, 담당 업무. 보기 차례는 사전 질문과 같게
  var PROF = [["gender", "성별", ["남", "여"]], ["age", "연령대", ["25세 이하", "26-35세", "36-45세", "46-55세", "56-65세", "66세 이상"]],
    ["job", "담당 업무", ["관제, 운영", "안전관리", "시설, 설비관리", "로봇, 시스템 개발"]]];
  function profileCards(R) {
    var total = R.people.length;
    return PROF.map(function (q) {
      var m = {};
      q[2].forEach(function (k) { m[k] = 0; });
      R.people.forEach(function (a) { var v = a.profile && a.profile[q[0]]; if (!v) { return; } if (/^기타/.test(v)) { v = "기타"; } m[v] = (m[v] || 0) + 1; });
      return '<div class="rp-card"><h3>' + q[1] + "</h3>" + profBars(m, total) + "</div>";
    }).join("");
  }
  function profBars(m, total) {
    return '<div class="rp-bars">' + Object.keys(m).map(function (k) {
      return '<div class="rp-bar" data-tip="' + esc(k + "  " + m[k] + "명 / " + total + "명") + '"><span class="l">' + esc(k) + '</span><span class="t"><span class="f" style="width:' + (total ? m[k] / total * 100 : 0) + '%"></span></span><span class="n">' + m[k] + "명</span></div>";
    }).join("") + "</div>";
  }

  // 공통질문 — 문항마다 1~7 점수별 인원(한 색의 진하기) + 평균
  var SEQ = ["#f1f3f6", "#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#184f95"];
  function likert(R) {
    var L = U.LIKERT || [], done = R.people.filter(function (a) { return a.post && a.post.likert; });
    if (!done.length) { return '<p class="rp-empty">기록 없음</p>'; }
    var h = '<div class="lk"><div class="lk-row lk-h"><span>문항</span>' + [1, 2, 3, 4, 5, 6, 7].map(function (v) { return '<span>' + v + '</span>'; }).join('') + '<span>평균</span></div>';
    L.forEach(function (q, i) {
      var c = [0, 0, 0, 0, 0, 0, 0], sum = 0;
      done.forEach(function (a) { var v = a.post.likert[i]; if (v) { c[v - 1]++; sum += v; } });
      var max = Math.max.apply(null, c), parts = q.split(':');
      h += '<div class="lk-row"><span class="lk-q"><strong class="k">' + parts[0] + '</strong>' + parts.slice(1).join(':') + '</span>' + c.map(function (n, k) {
        var lv = n ? Math.max(1, Math.round(n / max * 6)) : 0;
        var who = done.filter(function (a) { return a.post.likert[i] === k + 1; }).map(function (a) { return a.participant; }).join(' ');
        return '<span class="lk-c" style="background:' + SEQ[lv] + ';color:' + (lv >= 4 ? '#fff' : '#16191f') + '"' + (n ? ' data-tip="' + esc((k + 1) + '점  ' + n + '명  ' + who) + '"' : '') + '>' + (n || '') + '</span>';
      }).join('') + '<span class="lk-m">' + (sum / done.length).toFixed(1) + '</span></div>';
    });
    return h + '</div>';
  }
  // 주관식 — 문항마다 참가자 답변 목록(빈 답은 뺀다)
  function openAnswers(R) {
    var Q = U.OPEN || [];
    return '<div class="rp-qa">' + Q.map(function (q, i) {
      var list = R.people.map(function (a) { return [a.participant, a.post && a.post.open ? a.post.open[i] : ""]; }).filter(function (x) { return x[1] && String(x[1]).trim(); });
      return "<details><summary><em>" + (i + 1) + "</em>" + esc(q) + ' <span style="color:#8a919e;font-weight:600">답변 ' + list.length + "</span></summary><ul>" +
        list.map(function (x) { return "<li><b>" + x[0] + "</b><span>" + esc(x[1]) + "</span></li>"; }).join("") + "</ul></details>";
    }).join("") + "</div>";
  }
  function modeBars(R) {
    var m = { "화이트 모드": 0, "블랙 모드": 0, "상관없다": 0, "답 안 함": 0 }, n = 0;
    R.people.forEach(function (a) { if (!a.post) { return; } n++; m[a.post.mode || "답 안 함"]++; });
    return n ? profBars(m, n) : '<p class="rp-empty">기록 없음</p>';
  }

  function table(R) {
    var meds = R.S.map(function (s) { return s.med; });
    var h = '<table class="rp-tbl"><tr><th>참가자</th><th>성별</th><th>연령대</th><th>담당 업무</th><th>진행일시</th>' +
      [1, 2, 3].map(function (n) { return '<th class="num">S' + n + ' 수행</th><th class="num">S' + n + " 클릭</th>"; }).join("") +
      '<th>S3 조치 버튼</th><th class="num">S2 알림 확인까지</th><th>상태</th></tr>';
    R.people.forEach(function (a) {
      var rc = R.react.filter(function (r) { return r.p === a.participant; })[0];
      var conf = a.events.some(function (e) { return e.phase === "s3" && e.confirm; });
      var pf = a.profile || {};
      h += "<tr><td><b>" + a.participant + "</b></td><td>" + esc(pf.gender || "") + "</td><td>" + esc(pf.age || "") + "</td><td>" + esc(pf.job || "") + "</td><td>" + U.clock(a.startedAt).slice(5, 16) + "</td>" +
        [1, 2, 3].map(function (n) { var s = U.scenStat(a, n); return '<td class="num' + (meds[n - 1] && s.ms > meds[n - 1] * 2 ? " slow" : "") + '">' + mmss(s.ms) + '</td><td class="num">' + s.clicks + "</td>"; }).join("") +
        "<td>" + (a.scenarios[3] && a.scenarios[3].done ? (conf ? "누름" : "안 누름") : "") + '</td><td class="num">' + (rc ? mmss(rc.ms) : "") + "</td><td>" +
        (U.doneAll(a) ? "완료" : a.stopped ? "중단" : "진행 중") + "</td></tr>";
    });
    return h + "</table>";
  }

  function render(isSample) {
    var db = isSample ? sample() : U.db();
    var R = build(db);
    var stamp = U.clock(Date.now());
    var reactMed = median(R.react.map(function (r) { return r.ms; }));
    var firstTotal = Object.keys(R.first).reduce(function (s, k) { return s + R.first[k]; }, 0);
    sec.innerHTML = '<div class="rp">' +
      '<div class="rp-head"><h1>사용성 평가 결과 리포트' + (isSample ? '<span class="rp-badge">샘플 데이터</span>' : "") + "</h1>" +
      '<div class="rp-noprint row" style="margin:0"><a class="btn-text rec-home" href="#">← 처음으로</a>' +
      (U.SHEET_LINK ? '<a class="btn btn-line" href="' + U.SHEET_LINK + '" target="_blank" rel="noopener" style="text-decoration:none;color:inherit">구글 시트 열기</a>' : '') +
      '<button type="button" class="btn btn-line" onclick="window.print()">인쇄, PDF</button></div></div>' +
      '<p class="rp-meta">에이프리즘 관제 화면 v6, 미션 정기 순회 점검. 참가자 ' + R.people.length + "명. 만든 시각 " + stamp + "</p>" +
      '<div class="rp-view rp-noprint" role="tablist"><button type="button" role="tab" data-view="sum" aria-selected="' + (VIEW.mode === "sum") + '">요약</button>' +
      '<button type="button" role="tab" data-view="one" aria-selected="' + (VIEW.mode === "one") + '">개별</button></div>' +
      '<div id="rp-sum"' + (VIEW.mode === "sum" ? "" : " hidden") + ">" +

      '<div class="rp-sec">' + tiles(R) + "</div>" +

      '<div class="rp-sec"><h2>참가자 구성</h2><p class="rp-sub">사전 질문 답. 막대는 그 답을 고른 참가자 수.</p><div class="rp-grid3">' + profileCards(R) + "</div></div>" +

      '<div class="rp-sec"><h2>수행 시간</h2><p class="rp-sub">참가자마다 시나리오별로 걸린 시간. 시나리오 시작부터 수행 완료까지. 세 시나리오가 같은 눈금이다.</p><div class="rp-card">' + perPerson(R) + "</div></div>" +

      '<div class="rp-sec"><h2>시나리오별 클릭 지도와 인터뷰 답변</h2><p class="rp-sub">시나리오를 고르면 그 시나리오의 클릭 지도와 인터뷰 답변이 함께 나온다. 참가자를 고르면 누른 순서대로 번호가 붙는다.</p><div class="rp-card" id="cm"></div></div>' +

      '<div class="rp-sec"><h2>시나리오 2 알림 반응</h2><p class="rp-sub">새 위험 알림이 들어온 뒤의 첫 행동.</p><div class="rp-grid2">' +
      '<div class="rp-card"><h3>알림 뒤 처음 누른 곳</h3>' + firstMap(R) + "</div>" +
      '<div class="rp-tile"><div class="k">알림 확인까지 걸린 시간(중앙값)</div><div class="v">' + (reactMed != null ? mmss(reactMed) : "-") + '</div><div class="s">알림이 들어온 뒤 최신 알림이나 알림 상세를 처음 누를 때까지. ' + R.react.length + "명 기준</div></div>" +
      "</div>" +
      '<div class="rp-grid2" style="margin-top:12px"><div class="rp-card"><h3>알림 상세를 연 경로</h3>' + bars(R.via, R.opens.length, 6) + '</div>' +
      '<div class="rp-tile"><div class="k">알림 상세를 열기까지(중앙값)</div><div class="v">' + (median(R.opens) != null ? mmss(median(R.opens)) : "-") + '</div><div class="s">위험 알림이 뜬 뒤 알림 상세 팝오버(또는 안전진단 화면)가 처음 열릴 때까지. ' + R.opens.length + "명 기준</div></div>" +
      "</div></div>" +

      '<div class="rp-sec"><h2>막힌 신호</h2><p class="rp-sub">인터뷰에서 함께 짚어 볼 장면.</p><div class="rp-card">' + flags(R) + "</div></div>" +

      '<div class="rp-sec"><h2>참가자별</h2><p class="rp-sub">빨간 시간은 그 시나리오 중앙값의 2배를 넘은 것.</p><div class="rp-card" style="padding:0;overflow:auto">' + table(R) + "</div></div>" +

      '<div class="rp-sec"><h2>공통질문</h2><p class="rp-sub">7점 척도(1 전혀 그렇지 않다, 7 매우 그렇다). 칸의 숫자는 그 점수를 고른 참가자 수, 색이 진할수록 많다.</p><div class="rp-card">' + likert(R) + '</div>' +
      '<div class="rp-grid2" style="margin-top:12px"><div class="rp-card"><h3>선호 화면 모드</h3>' + modeBars(R) + '</div><div></div></div></div>' +

      '<div class="rp-sec"><h2>주관식 답변</h2><p class="rp-sub">문항을 누르면 참가자별 답변이 펼쳐진다.</p>' + openAnswers(R) + '</div>' +

      '</div><div id="rp-one"' + (VIEW.mode === "one" ? "" : " hidden") + "></div>" + "</div>";
    CUR = R;
    paintOne();
    paintMap();
  }

  // ================================================================
  // 클릭 지도 — 테스트 화면 그림 위에 누른 자리. 좌표는 테스트 화면 1920×1080 기준
  //   크게 보기: 전체(16명 점 겹침) 또는 한 명(누른 순서 번호 + 지나간 길)
  //   참가자 고르기: 4줄(4×4). 아래 작은 화면 16개 — 누르면 그 사람으로
  // ================================================================
  var CUR = null, cm = { s: 1, p: "all" };
  function clicksOf(a, n) {
    var s = a.scenarios[n]; if (!s) { return { on: [], off: [] }; }
    var all = a.events.filter(function (e) { return e.phase === "s" + n && e.type === "click" && e.stage === "run"; });
    return {
      on: all.filter(function (e) { return e.x != null && (!e.page || /main-v6\.html$/.test(e.page)); }),
      off: all.filter(function (e) { return !(e.x != null && (!e.page || /main-v6\.html$/.test(e.page))); }),
      start: s.start
    };
  }
  function tipOf(a, e, i, start) {
    return a.participant + "  " + (i + 1) + "번째  " + mmss(e.t - start) + "  " + (e.area || "") + (e.label && e.label !== e.area ? " \"" + e.label + "\"" : "") + (e.dead ? "  빈 링크" : "") + (e.confirm ? "  조치 버튼" : "");
  }
  function dots(a, n, mode) {
    var c = clicksOf(a, n), g = "";
    if (mode === "one") {
      if (c.on.length > 1) { g += '<polyline points="' + c.on.map(function (e) { return e.x + "," + e.y; }).join(" ") + '" fill="none" stroke="#2a78d6" stroke-width="5" stroke-opacity=".55" stroke-linejoin="round"/>'; }
      c.on.forEach(function (e, i) {
        var t = esc(tipOf(a, e, i, c.start));
        g += '<g data-tip="' + t + '"><circle cx="' + e.x + '" cy="' + e.y + '" r="26" fill="' + (e.dead ? "#fff" : "#2a78d6") + '" stroke="' + (e.dead ? "#2a78d6" : "#fff") + '" stroke-width="5"/>' +
          '<text x="' + e.x + '" y="' + (e.y + 10) + '" text-anchor="middle" font-size="28" font-weight="800" fill="' + (e.dead ? "#2a78d6" : "#fff") + '">' + (i + 1) + "</text></g>";
      });
    } else {
      c.on.forEach(function (e, i) {
        g += '<circle cx="' + e.x + '" cy="' + e.y + '" r="' + (mode === "thumb" ? 22 : 16) + '" fill="' + (e.dead ? "#fff" : "#2a78d6") + '" fill-opacity="' + (e.dead ? 1 : 0.6) + '" stroke="' + (e.dead ? "#2a78d6" : "#fff") + '" stroke-width="' + (mode === "thumb" ? 5 : 4) + '"' +
          (mode === "thumb" ? "" : ' data-tip="' + esc(tipOf(a, e, i, c.start)) + '"') + "/>";
      });
    }
    return { svg: g, on: c.on.length, off: c.off };
  }
  function screen(n, inner, cls) {
    return '<div class="' + cls + '"><img src="' + BG[n] + '" alt=""><svg viewBox="0 0 1920 1080" preserveAspectRatio="none">' + inner + "</svg></div>";
  }
  // 그 시나리오 인터뷰 답변 — 문항을 누르면 참가자별 답이 펼쳐진다
  function scnAnswers(n, people) {
    var qs = U.QLIST.filter(function (q) { return q[0].charAt(0) === String(n); });
    return '<h3 class="cm-h">시나리오 ' + n + ' 인터뷰 답변</h3><div class="rp-qa">' + qs.map(function (q) {
      var list = people.map(function (a) { return [a.participant, U.answerOf(a, q[0], q[1])]; }).filter(function (x) { return x[1] && String(x[1]).trim(); });
      return "<details><summary><em>TASK " + q[0] + "</em> " + (q[1] + 1) + ". " + esc(q[2]) + ' <span style="color:#8a919e;font-weight:600">답변 ' + list.length + "</span></summary><ul>" +
        list.map(function (x) { return "<li><b>" + x[0] + "</b><span>" + esc(x[1]) + "</span></li>"; }).join("") + "</ul></details>";
    }).join("") + "</div>";
  }
  function paintMap() {
    var box = document.getElementById("cm"); if (!box || !CUR) { return; }
    var R = CUR, n = cm.s, people = R.people;
    var one = cm.p !== "all" && people.filter(function (a) { return a.participant === cm.p; })[0];
    var inner = "", total = 0, offs = [];
    (one ? [one] : people).forEach(function (a) { var d = dots(a, n, one ? "one" : "all"); inner += d.svg; total += d.on; offs = offs.concat(d.off); });
    var offNote = offs.length ? "다른 화면에서 누른 " + offs.length + "회 제외(" + Object.keys(offs.reduce(function (m, e) { m[e.page || "알 수 없음"] = 1; return m; }, {})).join(", ") + ")" : "";
    var head = '<div class="cm-tabs" role="tablist">' + U.SCEN.map(function (sc) {
      return '<button type="button" role="tab" aria-selected="' + (sc.no === n) + '" data-cm-s="' + sc.no + '">시나리오 ' + sc.no + " " + esc(sc.title) + "</button>";
    }).join("") + "</div>";
    var pick = '<div class="cm-pick"><button type="button" class="cm-all" aria-pressed="' + !one + '" data-cm-p="all">전체 ' + people.length + "명</button><div class=\"cm-grid\">";
    for (var i = 1; i <= U.PEOPLE; i++) {
      var p = U.pid(i), a = people.filter(function (x) { return x.participant === p; })[0];
      var k = a ? clicksOf(a, n).on.length : 0;
      pick += '<button type="button" aria-pressed="' + (cm.p === p) + '" data-cm-p="' + p + '"' + (a ? "" : " disabled") + "><b>" + p + "</b><span>" + (a ? k + "회" : "-") + "</span></button>";
    }
    pick += "</div></div>";
    var cap = one ? "<b>" + one.participant + "</b> 시나리오 " + n + " 수행 " + mmss(U.scenStat(one, n).ms) + ", 화면 클릭 " + total + "회" : "<b>전체</b> 시나리오 " + n + ", 화면 클릭 " + total + "회";
    var legend = '<div class="rp-legend"><span><i></i>클릭</span><span><i class="ring"></i>빈 링크(연결 안 된 메뉴)</span>' + (one ? "<span>숫자는 누른 순서, 선은 지나간 길</span>" : "<span>점에 마우스를 올리면 누가, 언제, 무엇을</span>") + "</div>";
    var thumbs = '<h3 class="cm-h">참가자별</h3><div class="cm-thumbs">' + people.map(function (a) {
      var d = dots(a, n, "thumb");
      return '<button type="button" class="cm-thumb" aria-pressed="' + (cm.p === a.participant) + '" data-cm-p="' + a.participant + '">' + screen(n, d.svg, "cm-scr") +
        "<span><b>" + a.participant + "</b> 클릭 " + d.on + "회, " + mmss(U.scenStat(a, n).ms) + "</span></button>";
    }).join("") + "</div>";
    box.innerHTML = head + '<div class="cm-main"><div><p class="cm-cap">' + cap + "</p>" + screen(n, inner, "cm-scr cm-big") + legend +
      (offNote ? '<p class="cm-off">' + esc(offNote) + "</p>" : "") + "</div>" + pick + "</div>" + thumbs + scnAnswers(n, people);
  }
  sec.addEventListener("click", function (e) {
    var s = e.target.closest("[data-cm-s]"), p = e.target.closest("[data-cm-p]");
    if (s) { cm.s = Number(s.getAttribute("data-cm-s")); paintMap(); }
    else if (p && !p.disabled) {
      cm.p = p.getAttribute("data-cm-p"); paintMap();
      if (p.classList.contains("cm-thumb")) { document.getElementById("cm").scrollIntoView({ behavior: "smooth", block: "start" }); }
    }
  });

  // 시나리오 2 — 알림 뒤 첫 클릭만, 참가자 번호를 붙여
  function firstMap(R) {
    var g = "", n = 0;
    R.people.forEach(function (a) {
      var ai = a.events.filter(function (e) { return e.phase === "s2" && e.type === "alert-in"; })[0];
      if (!ai) { return; }
      var f = a.events.filter(function (e) { return e.phase === "s2" && e.type === "click" && e.t >= ai.t && e.x != null; })[0];
      if (!f) { return; }
      n++;
      var t = esc(a.participant + "  알림 뒤 " + mmss(f.t - ai.t) + "  " + (f.area || ""));
      g += '<g data-tip="' + t + '"><circle cx="' + f.x + '" cy="' + f.y + '" r="30" fill="#2a78d6" stroke="#fff" stroke-width="5"/>' +
        '<text x="' + f.x + '" y="' + (f.y + 9) + '" text-anchor="middle" font-size="24" font-weight="800" fill="#fff">' + a.participant.slice(1) + "</text></g>";
    });
    if (!n) { return '<p class="rp-empty">기록 없음</p>'; }
    return '<p class="cm-cap">알림이 뜬 화면(알림 상세가 열린 판) 위에 첫 클릭. 숫자는 참가자 번호</p>' + screen(2, g, "cm-scr");
  }

  // ================================================================
  // 개별 보기 — 한 사람씩. ‹ › 로 넘기고, 목록에서 고른다. 기록 화면 [자세히] 는 #report-p03 으로 바로 연다
  // ================================================================
  var VIEW = { mode: "sum", p: null };
  // 긴 시간은 "11분 33초"
  function minSec(ms) { var t = Math.round(ms / 1000), m = Math.floor(t / 60), s = t % 60; return m ? m + "분 " + s + "초" : s + "초"; }
  function lkName(q) { return q.split(":")[0]; }
  function paintOne() {
    var box = document.getElementById("rp-one"); if (!box || !CUR) { return; }
    var R = CUR, ppl = R.people;
    if (!ppl.length) { box.innerHTML = '<p class="rp-empty">기록 없음</p>'; return; }
    var i = Math.max(0, ppl.findIndex(function (a) { return a.participant === VIEW.p; }));
    var a = ppl[i]; VIEW.p = a.participant;
    var pf = a.profile || {}, post = a.post || {};
    function info(k, v) { return "<div><span>" + k + "</span><b>" + esc(v || "-") + "</b></div>"; }
    var total = a.endedAt ? a.endedAt - a.startedAt : null;
    var dOpen = a.events.filter(function (e) { return e.phase === "s2" && e.type === "detail-open"; })[0];
    var conf = a.events.filter(function (e) { return e.phase === "s3" && e.confirm; })[0], s3 = a.scenarios[3];
    var nav = '<div class="one-nav"><button type="button" data-one-step="-1" aria-label="앞 참가자"' + (i === 0 ? " disabled" : "") + ">‹</button>" +
      '<select id="one-pick" aria-label="참가자 고르기">' + ppl.map(function (x, k) { return '<option value="' + x.participant + '"' + (k === i ? " selected" : "") + ">" + x.participant + "</option>"; }).join("") + "</select>" +
      "<span>" + (i + 1) + " / " + ppl.length + "</span>" +
      '<button type="button" data-one-step="1" aria-label="다음 참가자"' + (i === ppl.length - 1 ? " disabled" : "") + ">›</button></div>";
    var head = '<div class="one-info">' + info("진행일시", U.clock(a.startedAt).slice(0, 16)) + info("상태", U.doneAll(a) ? "완료" : a.stopped ? "중단" : "진행 중") +
      info("전체 소요", total ? minSec(total) : "") + info("자유 탐색", a.explore && a.explore.end ? minSec(a.explore.end - a.explore.start) : "") + info("성별", pf.gender) + info("연령대", pf.age) + info("담당 업무", pf.job) + info("선호 화면 모드", post.mode) + "</div>";
    var sc = '<table class="rp-tbl"><tr><th>시나리오</th><th class="num">수행 시간</th><th class="num">클릭</th><th class="num">인터뷰 시간</th><th>참고</th></tr>' +
      [1, 2, 3].map(function (n) {
        var x = U.scenStat(a, n), note = "";
        if (n === 2 && dOpen) { note = "알림 상세를 " + mmss(dOpen.ms) + " 만에 엶(" + esc(dOpen.area || "") + ")"; }
        if (n === 3 && s3) { note = conf ? "조치 버튼 첫 클릭 " + mmss(conf.t - s3.start) : "조치 버튼 안 누름"; }
        return "<tr><td>시나리오 " + n + " " + esc(U.SCEN[n - 1].title) + '</td><td class="num">' + mmss(x.ms) + '</td><td class="num">' + x.clicks + '</td><td class="num">' + mmss(x.iv) + "</td><td>" + note + "</td></tr>";
      }).join("") + "</table>";
    var maps = '<div class="one-maps">' + [1, 2, 3].map(function (n) {
      var d = dots(a, n, "one");
      return '<div><p class="cm-cap"><b>시나리오 ' + n + "</b> 화면 클릭 " + d.on + "회</p>" + screen(n, d.svg, "cm-scr") + "</div>";
    }).join("") + "</div>";
    var qa = '<table class="rp-tbl"><tr><th>TASK</th><th>문항</th><th>답변</th></tr>' + U.QLIST.map(function (q) {
      return "<tr><td>" + q[0] + '</td><td class="wrap">' + (q[1] + 1) + ". " + esc(q[2]) + '</td><td class="wrap">' + esc(U.answerOf(a, q[0], q[1])) + "</td></tr>";
    }).join("") + "</table>";
    var lk = (U.LIKERT || []).map(function (q, k) { var v = post.likert ? post.likert[k] : ""; return '<div class="one-lk"><span>' + esc(lkName(q)) + "</span><b>" + (v || "-") + "</b></div>"; }).join("");
    var op = (U.OPEN || []).map(function (q, k) { var v = post.open ? post.open[k] : ""; return v && String(v).trim() ? "<tr><td class=\"wrap\">" + (k + 1) + ". " + esc(q) + '</td><td class="wrap">' + esc(v) + "</td></tr>" : ""; }).join("");
    box.innerHTML = nav +
      '<div class="rp-sec" style="margin-top:20px"><h2>' + a.participant + "</h2>" + head + "</div>" +
      '<div class="rp-sec"><h2>시나리오</h2><div class="rp-card" style="padding:0;overflow:auto">' + sc + "</div></div>" +
      [1, 2, 3].map(function (n) {
        var d = dots(a, n, "one"), x = U.scenStat(a, n);
        var rows = U.QLIST.filter(function (q) { return q[0].charAt(0) === String(n); }).map(function (q) {
          return "<tr><td>" + q[0] + '</td><td class="wrap">' + (q[1] + 1) + ". " + esc(q[2]) + '</td><td class="wrap">' + esc(U.answerOf(a, q[0], q[1])) + "</td></tr>";
        }).join("");
        return '<div class="rp-sec"><h2>시나리오 ' + n + " " + esc(U.SCEN[n - 1].title) + '</h2><p class="rp-sub">수행 ' + mmss(x.ms) + ", 화면 클릭 " + d.on + "회. 지도 숫자는 누른 순서.</p>" +
          '<div class="one-scn"><div class="rp-card">' + screen(n, d.svg, "cm-scr") + '</div><div class="rp-card" style="padding:0;overflow:auto"><table class="rp-tbl"><tr><th>TASK</th><th>문항</th><th>답변</th></tr>' + rows + "</table></div></div></div>";
      }).join("") +
      '<div class="rp-sec"><h2>공통질문</h2><div class="rp-card"><h3>7점 척도</h3><div class="one-lks">' + lk + "</div>" +
      (op ? '<h3 style="margin-top:20px">주관식</h3><table class="rp-tbl">' + op + "</table>" : "") + "</div></div>";
  }
  sec.addEventListener("click", function (e) {
    var v = e.target.closest("[data-view]");
    if (v) {
      VIEW.mode = v.getAttribute("data-view");
      document.getElementById("rp-sum").hidden = VIEW.mode !== "sum";
      document.getElementById("rp-one").hidden = VIEW.mode !== "one";
      Array.prototype.forEach.call(sec.querySelectorAll("[data-view]"), function (b) { b.setAttribute("aria-selected", String(b === v)); });
      paintOne(); return;
    }
    var st = e.target.closest("[data-one-step]");
    if (st && CUR) {
      var ppl = CUR.people, i = ppl.findIndex(function (a) { return a.participant === VIEW.p; }) + Number(st.getAttribute("data-one-step"));
      if (ppl[i]) { VIEW.p = ppl[i].participant; paintOne(); window.scrollTo(0, 0); }
    }
  });
  sec.addEventListener("change", function (e) { if (e.target.id === "one-pick") { VIEW.p = e.target.value; paintOne(); } });

  // 마우스를 올리면 값
  sec.addEventListener("mousemove", function (e) {
    var el = e.target.closest("[data-tip]");
    if (!el) { tip.hidden = true; return; }
    tip.textContent = el.getAttribute("data-tip");
    tip.hidden = false;
    tip.style.left = Math.min(window.innerWidth - tip.offsetWidth - 8, e.clientX + 14) + "px";
    tip.style.top = (e.clientY + 16) + "px";
  });
  sec.addEventListener("mouseleave", function () { tip.hidden = true; });

  // 주소 — #report · #report-sample. 그 밖이면 처음 화면
  function route() {
    var h = location.hash.replace("#", "");
    var m = /^report(-sample)?(?:-(p\d\d))?$/.exec(h);
    if (m) {
      var sampleOn = !!m[1];
      if (m[2]) { VIEW.mode = "one"; VIEW.p = m[2].toUpperCase(); } else { VIEW.mode = "sum"; }
      render(sampleOn); U.show("report"); window.scrollTo(0, 0);
      if (!sampleOn && U.pull) { U.pull(function () { render(false); }); }
    }
    else if (!document.getElementById("report").hidden) { U.show("home"); }
  }
  window.addEventListener("hashchange", route);
  route();
})();
