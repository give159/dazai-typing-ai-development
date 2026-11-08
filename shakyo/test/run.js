// jsdom 回帰テスト：JSDOM=<jsdomのパス> node test/run.js
const fs = require("fs"), path = require("path");
const { JSDOM } = require(process.env.JSDOM || "jsdom");
const file = fs.readdirSync(path.join(__dirname, "../dist")).filter(f => /^usausa-shakyo-dojo_v.*\.html$/.test(f)).sort().pop();
const html = fs.readFileSync(path.join(__dirname, "../dist", file), "utf8");
let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) pass++; else { fail++; console.log("✕", name); } };
const boot = (store) => new JSDOM(html, { runScripts: "dangerously", pretendToBeVisual: true, url: "https://example.test/",
  beforeParse(w) { if (store !== undefined) w.localStorage.setItem("usausa-shakyo-v1", store); } }).window;

// ── 構造 ──
const ver = (html.match(/version: "([0-9.]+)"/) || [])[1];
t("外部の読みこみがない", !/(src|href)\s*=\s*["']https?:/i.test(html) && !/@import|fonts\.googleapis/.test(html));
t("版数は APP にだけ", ver && html.split(ver).length === 2);
t("PRO 刻印は APP.grade", /grade: "PRO"/.test(html));
t("__BUILD__ が置換済み", !html.includes("__BUILD__"));
t("ファイル名の版と APP が一致", file.includes("v" + ver + ".html"));

// ── 壊れた保存でも開く（v1.0 で落ちた形）──
for (const s of ['{"mine":"x"}', '{"mine":[{"id":1}]}', '{"best":null}', 'not json', '[]', '{"lv":-5,"history":"x","skin":"<x>"}']) {
  const w = boot(s); const n = w.document.querySelectorAll("#shelf button[data-id]").length;
  t("壊れた保存 " + s, n === 14 && w.document.getElementById("work-h").textContent !== "—");
}
t("壊れた保存を知らせる", /読めなかった/.test(boot("not json").document.getElementById("store-note").textContent));

(async () => {
const w = boot(), L = w.ShakyoLogic, d = w.document, $ = id => d.getElementById(id);

// ── ロジック ──
let j = L.judge("メロスは激怒した。", "メロスは激");
t("judge: 途中まで ok", j.ok === 5 && j.states[5] === "todo" && !j.done);
j = L.judge("あいう", "あかう");
t("judge: 違う字は ng", j.states[1] === "ng" && j.firstErr === 1);
t("judge: 完成", L.judge("あ。", "あ。").done);
t("judge: 全角半角を気にしない", L.judge("はい！", "はい!", true).done && !L.judge("はい！", "はい!", false).done);
t("judge: 全角スペースと半角スペース", L.judge("走れ！　メロス。", "走れ! メロス.", true).states[3] === "ok");
let s = { prev: "", score: 0, combo: 0, maxCombo: 0, miss: 0, scored: [] };
s = L.step(s, "あいう", "あい");
t("step: 2字で加点", s.score === 23 && s.combo === 2);
s = L.step(s, "あいう", "あ"); s = L.step(s, "あいう", "あい");
t("step: 打ち直しで二重加点しない", s.score === 23 && s.miss === 0);
s = L.step(s, "あいう", "あいえ");
t("step: ミスでコンボが切れる", s.miss === 1 && s.combo === 0);
t("cpm（最低1秒）", L.cpm(60, 30000) === 120 && L.cpm(5, 0) === 0 && L.cpm(36, 1) === 2160);
t("rank 時計あり", L.rank(0.99, 120).mark === "秀" && L.rank(0.96, 70).mark === "優" && L.rank(0.99, 10).mark === "良" && L.rank(0.5, 200).mark === "可");
t("rank 時計なしは正確さだけ", L.rank(0.99, null, false).mark === "秀" && L.rank(0.96, null, false).mark === "優");
let e = L.addExp(1, 0, 200);
t("addExp", e.lv > 1 && e.exp < L.needExp(e.lv));
const day = new Date(2026, 9, 31, 9, 5);
t("日付", L.ymd(day) === "2026-10-31" && L.hm(day) === "09:05" && L.jpDate(day) === "2026年10月31日（土）");
t("sanitize: 既定は音なし", L.sanitize(null).sound === false && L.sanitize({ sound: true }).sound === true);
// CSV
const rec = [{ date: "2026-10-31", time: "17:45", title: "=HYPERLINK(\"x\")", status: "完了", total: 3, typed: 3, timer: true, sec: "4.2", cpm: 43, acc: 100, miss: 0, maxCombo: 3, score: 99, rank: "秀" },
             { date: "2026-10-31", time: "17:50", title: "a,b\n改行", status: "途中でおしまい", total: 3, typed: 1, timer: false, sec: "", cpm: "", acc: 50, miss: 1, maxCombo: 1, score: 11, rank: "—" }];
const csv = L.recordsToCSV(rec);
t("CSV: BOM と見出し", csv.startsWith("﻿日付,時刻,課題"));
t("CSV: 数式を無害化", csv.includes("\"'=HYPERLINK(\"\"x\"\")\""));
t("CSV: カンマ・改行を囲む", csv.includes("\"a,b\n改行\""));
t("CSV: 時計なし", csv.split("\r\n")[2].includes(",なし,"));
t("CSV: 負の数に見える値も無害化", L.csvCell("-1+1") === "'-1+1" && L.csvCell("@x") === "'@x");
t("TSV: タブと改行を消す", !L.recordsToTSV(rec).split("\n")[2].includes("\t改行") && L.recordsToTSV(rec).split("\n").length === 3);
// 文字コード（Node の TextDecoder を渡して検査）
const TD = TextDecoder;
t("メモ帳 ANSI（Shift_JIS）", (r => r.text === "あい。" && /Shift_JIS/.test(r.enc))(L.decodeText(Buffer.from([0x82, 0xa0, 0x82, 0xa2, 0x81, 0x42]), TD)));
t("メモ帳 UTF-8（BOM）", L.decodeText(Buffer.from([0xEF, 0xBB, 0xBF, 0xE3, 0x81, 0x82]), TD).text === "あ");
t("メモ帳 UTF-8（BOM なし）", L.decodeText(Buffer.from("走れ", "utf8"), TD).enc === "UTF-8");
t("メモ帳 Unicode（UTF-16LE）", L.decodeText(Buffer.concat([Buffer.from([0xFF, 0xFE]), Buffer.from("月見草", "utf16le")]), TD).text === "月見草");
// 取り込み
t("cleanLine", L.cleanLine("- **太字** と [リンク](https://x.y)") === "太字 と リンク");
t("cleanLine: 文中のマイナスは残す", L.cleanLine("-5度だった") === "-5度だった");
t("splitChunks", (c => c.length === 3 && c[0] === "一文目です。")(L.splitChunks("一文目です。二文目です。三文目です。", 8)));
t("splitChunks: 上限", L.splitChunks("あ".repeat(100), 40).every(c => Array.from(c).length <= 40));
t("splitChunks: 英文の改行は空白に", L.splitChunks("Hello\nworld.", 80)[0] === "Hello world.");
t("貼り付けの先頭『注意: …』を落とさない", L.parseMarkdown("注意: 火を使います。\n鍋を温める。", "メモ", 80)[0].text.startsWith("注意"));
t("Notion の .md は属性行を外す", !/タグ/.test(L.parseMarkdown("# 研修メモ\nタグ: 研修\n\n本文。", "", 80, { props: true })[0].text));
const md = L.parseMarkdown("# 研修メモ\n\n## はじめに\n今日は**とても**楽しかった。\n\n```\ncode\n```\n| a | b |", "", 80);
t("parseMarkdown: 題名・見出し・除外", md[0].title.startsWith("研修メモ／はじめに") && md.every(i => !/code|\|/.test(i.text)) && md[0].text.includes("とても楽しかった"));
const ci = L.csvToItems('Name,本文,Tags\n"走る","一行目。\n二行目。",x\n歩く,"""引用""です。",y\n', 80);
t("csvToItems", ci.length === 2 && ci[0].title === "走る" && ci[0].text === "一行目。二行目。" && ci[1].text === '"引用"です。');
t("notionText", (n => n.title === "ページ" && n.markdown.trim() === "本文です。")(L.notionText({ title: "ページ", text: "<page><content>\n本文です。\n</content></page>" })));


// ── 長文と練習のしかた（ロジック）──
t("splitSentences", JSON.stringify(L.splitSentences("一。二！「三」と言った。四")) === JSON.stringify(["一。","二！","「三」と言った。","四"]));
const pool = [{ title: "A", text: "あいう。えお。" }, { title: "B", text: "かきく。" }, { title: "C", text: "さしすせそ。" }];
t("buildPages 1題", (p => p.length === 1 && p[0].text === "かきく。")(L.buildPages(pool, 1, "one", 1)));
t("buildPages 文の数（続きから・一周する）", (p => p.map(x => x.text).join("") === "かきく。さしすせそ。あいう。えお。")(L.buildPages(pool, 1, "sent", 4, 80)));
t("buildPages 字数（文の切れ目まで）", (p => L.len(p.map(x => x.text).join("")) >= 10 && p.map(x => x.text).join("") === "あいう。えお。かきく。")(L.buildPages(pool, 0, "chars", 10, 80)));
t("buildPages ページは max 字まで", L.buildPages(pool, 0, "sent", 4, 8).every(x => L.len(x.text) <= 8));
t("buildPages 長い1文は max で切る", L.buildPages([{ title: "L", text: "あ".repeat(200) + "。" }], 0, "sent", 1, 80).every(x => L.len(x.text) <= 80));
t("buildPages 時間は十分な量", L.len(L.buildPages(pool, 0, "time", 1, 80).map(x => x.text).join("")) >= 600);
t("buildPages 空なら空", L.buildPages([], 0, "sent", 3).length === 0 && L.buildPages([{ title: "x", text: "" }], 0, "sent", 3).length === 0);
t("modeLabel", L.modeLabel("sent", 5) === "5文" && L.modeLabel("chars", 200) === "200字" && L.modeLabel("time", 3) === "3分" && L.modeLabel("one", 1) === "1題");
t("fmtLeft", L.fmtLeft(150000) === "2:30" && L.fmtLeft(-5) === "0:00");
t("sanitize: 練習のしかた", L.sanitize({ mode: "time", modeN: { time: 5, sent: 999 } }).mode === "time" && L.sanitize({ mode: "x" }).mode === "one" && !L.sanitize({ modeN: { sent: 999 } }).modeN.sent);

// ── 画面：はじめての案内・並び・読み上げ ──
t("版数バッジ", $("vbadge").textContent === "PRO v" + ver);
t("はじめての案内が出る", !$("guide").hidden);
t("棚は入門から", d.querySelector("#shelf button[data-id]").dataset.id === "meros-3");
t("スマホ用の選択欄も同じ数", d.querySelectorAll("#pick-sel option").length === 14);
t("お手本を読み上げられる", $("target-sr").textContent === "お手本：王様は、人を殺します。");
t("音は最初なし", $("bell").getAttribute("aria-pressed") === "false" && $("bell-t").textContent === "音なし");
$("bell").click();
t("ベルで音あり", $("bell").getAttribute("aria-pressed") === "true" && JSON.parse(w.localStorage.getItem("usausa-shakyo-v1")).sound === true);
$("bell").click();

// ── 開始・写す・おしまい ──
const ta = $("typing");
const type = v => { ta.value = v; ta.dispatchEvent(new w.Event("input", { bubbles: true })); };
t("準備中は打てない", ta.readOnly && $("main-btn").textContent.startsWith("開始") && $("phase").textContent === "準備中");
type("王様"); t("準備中の入力は採点しない", $("h-combo").textContent === "×0");
ta.value = "";
$("main-btn").click();
t("開始で写しはじめる", !ta.readOnly && $("main-btn").textContent.startsWith("おしまい") && $("phase").textContent === "写しています");
t("時計・正確さの設定は写す間は変えられない", $("opt-timer").disabled && $("opt-loose").disabled);
type("王様は");
t("正しい字が ok", $("genko").children[0].className === "ok" && $("h-combo").textContent === "×3");
t("次の字を出す", /「、」/.test($("nextch").textContent) && /3 \/ 11/.test($("nextch").textContent));
type("王様は。");
t("どこが違うかを具体的に出す", $("genko").children[3].className === "ng" && /4字目.*「、」.*「。」/.test($("live").textContent));
ta.dispatchEvent(new w.Event("compositionstart")); ta.value = "王様は、ひと"; ta.dispatchEvent(new w.Event("input"));
const missBefore = $("h-miss").textContent;
t("変換中は採点しない", $("genko").children[4].className === "ng" || missBefore === "1");
ta.value = "王様は、人"; ta.dispatchEvent(new w.Event("compositionend"));
t("確定で採点", $("genko").children[4].className === "ok");
const pe = new w.Event("paste", { bubbles: true, cancelable: true }); ta.dispatchEvent(pe);
t("貼り付けを止める", pe.defaultPrevented && /貼り付け/.test($("live").textContent));
type("王様は、人を殺します。ああ");
t("長すぎると具体的に案内", /2 字多く/.test($("live").textContent) && $("result").hidden);
type("王様は、人を殺します。");
t("最後まで打つと自動でおしまい", !$("result").hidden && /秀|優|良|可/.test($("res-hanko").textContent));
t("結果に今日の日付", $("res-when").textContent.startsWith(L.jpDate(new Date())));
let st = JSON.parse(w.localStorage.getItem("usausa-shakyo-v1"));
t("記録が日付つきで残る", st.history.length === 1 && st.history[0].date === L.ymd(new Date()) && st.history[0].status === "完了");
t("1題：字数を二重に数えない", st.history[0].typed === 11 && st.history[0].total === 11 && /11 \/ 11 字/.test($("res-dl").textContent));
t("最高記録が棚に出る", /最高/.test(d.querySelector('#shelf button[data-id="meros-3"]').textContent));
t("結果の中にフォーカス", d.activeElement === $("res-next"));
$("res-next").click();
t("次の課題へ（準備中に戻る）", $("work-h").textContent === "走れメロス（五）" && $("result").hidden && $("phase").textContent === "準備中");
// おしまい（途中）
$("main-btn").click(); type("勇者は");
$("main-btn").click();
t("おしまいで途中の結果", !$("result").hidden && /途中/.test($("res-h").textContent) && $("res-hanko").textContent.includes("途"));
st = JSON.parse(w.localStorage.getItem("usausa-shakyo-v1"));
t("途中の記録", st.history[1].status === "途中でおしまい" && st.history[1].typed === 3 && !st.best["meros-5"]);
$("res-next").click();
// 時計なし
$("opt-timer").checked = false; $("opt-timer").dispatchEvent(new w.Event("change"));
t("時計なしの表示", $("h-time").textContent === "なし");
$("main-btn").click(); type("メロスは、単純な男であった。");
t("時計なしの結果", /時計なし|なし（正確さ/.test($("res-dl").textContent) && !/1分あたり/.test($("res-dl").textContent));
$("res-next").click();
$("opt-timer").checked = true; $("opt-timer").dispatchEvent(new w.Event("change"));
// Esc
$("main-btn").click(); type("あさ");
d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape" }));
t("Esc でやり直し", $("phase").textContent === "準備中" && ta.value === "");


// ── 練習のしかた（画面）──
const modeBtn = m => d.querySelector('#mode-box [data-mode="' + m + '"]');
pickById = id => { const b = d.querySelector('#shelf button[data-id="' + id + '"]'); b.click(); };
pickById("meros-3");
modeBtn("sent").click(); $("mode-n").value = "3"; $("mode-n").dispatchEvent(new w.Event("change"));
t("文の数：3文で案内", /3文/.test($("mode-note").textContent) && !$("mode-n").hidden);
const pageText = () => Array.from($("genko").children).map(c => c.textContent).join("").replace(/　/g, " ");
$("main-btn").click();
t("写す間は練習のしかたを変えられない", modeBtn("one").disabled && $("mode-n").disabled);
let guard = 0;
while ($("result").hidden && guard++ < 10) type(pageText());
t("文の数：ページを進めて写し終える", !$("result").hidden && /写し終えました/.test($("res-h").textContent) && /3文/.test($("res-when").textContent));
let hs = JSON.parse(w.localStorage.getItem("usausa-shakyo-v1")).history; let last = hs[hs.length - 1];
t("記録に練習のしかた", last.mode === "3文" && last.status === "完了" && last.typed === last.total);
$("res-next").click();
modeBtn("chars").click(); $("mode-n").value = "100"; $("mode-n").dispatchEvent(new w.Event("change"));
t("字数：100字", /100字/.test($("mode-note").textContent) && /ページ/.test($("work-h").textContent));
$("main-btn").click(); guard = 0;
while ($("result").hidden && guard++ < 20) type(pageText());
hs = JSON.parse(w.localStorage.getItem("usausa-shakyo-v1")).history; last = hs[hs.length - 1];
t("字数：100字以上を写す", last.mode === "100字" && last.typed >= 100 && last.pages >= 2);
$("res-next").click();
// 時間：時計を進める
let fakeNow = 0; w.performance.now = () => fakeNow;
modeBtn("time").click(); $("mode-n").value = "1"; $("mode-n").dispatchEvent(new w.Event("change"));
$("opt-timer").checked = false; $("opt-timer").dispatchEvent(new w.Event("change"));
t("時間：時計なしでも時計を使う", $("h-time-l").textContent === "のこり" && $("h-time").textContent === "1:00");
$("main-btn").click();
fakeNow = 20000; type(pageText());
t("時間：ページが続く", /2 ページ目/.test($("work-h").textContent));
const halfway = await new Promise(r => setTimeout(() => r($("h-time").textContent), 250));
t("時間：のこりを数える", halfway === "0:40");
fakeNow = 61000;
await new Promise(r => setTimeout(r, 250));
hs = JSON.parse(w.localStorage.getItem("usausa-shakyo-v1")).history; last = hs[hs.length - 1];
t("時間：1分で自動でおしまい", !$("result").hidden && /1分たちました/.test($("res-h").textContent) && last.status === "時間まで" && last.sec === "60.0");
$("res-next").click();
$("opt-timer").checked = true; $("opt-timer").dispatchEvent(new w.Event("change"));
modeBtn("one").click();
t("1題に戻す", $("mode-n").hidden);

// ── 記録と書き出し ──
$("open-log").click();
t("記録の画面に今日の日付と件数", /今日 .*6 件/.test($("log-when").textContent) && $("log-body").children.length === 6);
t("1ファイル版では保存のリンクを作る", (() => { let made = null; const orig = w.HTMLAnchorElement.prototype.click; w.HTMLAnchorElement.prototype.click = function () { made = this.download; }; w.URL.createObjectURL = () => "blob:x"; w.URL.revokeObjectURL = () => {}; $("log-today").click(); w.HTMLAnchorElement.prototype.click = orig; return made === "shakyo-kiroku_" + L.ymd(new Date()) + ".csv"; })());
$("log-close").click();

// ── 見た目・レイアウト ──
$("skin").value = "dot"; $("skin").dispatchEvent(new w.Event("change"));
t("見た目の切りかえ", d.body.dataset.skin === "dot" && d.querySelectorAll(".cloud").length === 5);
$("lay-phone").click();
t("📱 でスマホ画面", d.body.dataset.layout === "phone" && $("lay-phone").getAttribute("aria-pressed") === "true");
$("lay-pc").click();
t("💻 でパソコン画面", d.body.dataset.layout === "pc" && $("lay-pc").getAttribute("aria-pressed") === "true");
$("pick-sel").value = "shayo-1"; $("pick-sel").dispatchEvent(new w.Event("change"));
t("選択欄で課題をえらべる", $("work-h").textContent === "斜陽");
$("guide-close").click();
t("案内を閉じると覚える", $("guide").hidden && JSON.parse(w.localStorage.getItem("usausa-shakyo-v1")).guideSeen);

// ── 取り込み ──
$("open-import").click();
$("imp-title").value = "<img src=x onerror=alert(1)>"; $("imp-text").value = "今日の学び。明日も続ける。"; $("imp-text").dispatchEvent(new w.Event("input"));
t("貼り付けの下見", d.querySelectorAll("#imp-preview li").length === 1 && !$("imp-add").disabled);
$("imp-add").click();
t("棚に入る", d.querySelectorAll("#shelf button[data-id]").length === 15);
t("題名の HTML は文字のまま", !d.querySelector("#shelf img") && /<img/.test($("shelf").textContent) && /自分の文章：<img/.test($("shelf").textContent));

// 長文の貼り付け → 作品ごとに続けて写す
$("imp-title").value = "長い文章"; $("imp-text").value = Array.from({ length: 60 }, (_, i) => "これは長い文章の" + (i + 1) + "番目の文です。").join(""); $("imp-text").dispatchEvent(new w.Event("input"));
t("長文の下見に全体の字数", /全部で \d+ 字/.test($("imp-msg").textContent));
$("imp-add").click(); $("imp-close").click();
const firstLong = Array.from(d.querySelectorAll("#shelf button[data-id]")).find(b => /長い文章/.test(b.textContent));
firstLong.click(); modeBtn("chars").click(); $("mode-n").value = "400"; $("mode-n").dispatchEvent(new w.Event("change"));
t("長文：同じ作品から400字", /400字/.test($("mode-note").textContent) && /長い文章/.test($("work-h").textContent));
modeBtn("one").click();
$("open-import").click();
const del = () => $("mine").querySelector("[data-del]");
const shelfN = () => d.querySelectorAll("#shelf button[data-id]").length, before = shelfN();
del().click();
t("消す前に確認", del().textContent === "本当に消す" && shelfN() === before);
del().click();
t("確認後に消える（作品ごと）", shelfN() === before - 1);
// 上限
const big = Array.from({ length: 2100 }, (_, i) => "文" + i + "です。").join("\n\n");
$("imp-text").value = big; $("imp-text").dispatchEvent(new w.Event("input")); $("imp-add").click();
t("上限 2000 題で止めて知らせる", JSON.parse(w.localStorage.getItem("usausa-shakyo-v1")).mine.length === 2000 && /上限 2000 題のため、残り \d+ 題は入れていません/.test($("imp-msg").textContent));
d.querySelector('[data-tab="notion"]').click();
setTimeout(() => {
  t("Notion が使えないとき理由を出す", /直接読めません/.test($("nt-state").textContent) && $("nt-go").disabled);
  console.log(`${pass} pass / ${fail} fail`);
  process.exit(fail ? 1 : 0);
}, 50);
})();
