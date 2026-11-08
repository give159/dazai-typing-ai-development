const fs=require("fs");const {JSDOM}=require(process.env.JSDOM);
const html=fs.readFileSync("dist/usausa-shakyo-dojo_v1.0.0.html","utf8");
function boot(store){const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true,url:"https://x.test/",
 beforeParse(w){ if(store!==undefined) w.localStorage.setItem("usausa-shakyo-v1",store);} });return dom.window;}
const r=(k,v)=>console.log(k.padEnd(34),v);
// 1 壊れた保存の形
for (const s of ['{"mine":"x"}','{"mine":[{"id":1}]}','{"best":null}','not json']){
  let err=null; const w=boot(s); w.addEventListener("error",e=>err=e.message);
  r("保存の形 "+s, w.document.getElementById("work-h").textContent+" / shelf="+w.document.querySelectorAll("#shelf button").length+(err?" ERR "+err:""));
}
const w=boot(), L=w.ShakyoLogic, d=w.document;
// 2 先頭行の取りこぼし
r("貼り付け先頭『注意: …』", JSON.stringify(L.parseMarkdown("注意: 火を使います。\n鍋を温める。","メモ",80).map(i=>i.text)));
// 3 英文の改行
r("英文の改行結合", JSON.stringify(L.splitChunks("Hello\nworld.",80)));
// 4 半角と全角
r("半角!と全角！", L.judge("はい！","はい!").states.join(","));
// 5 Shift_JIS（メモ帳ANSI）
const sj=Buffer.from([0x82,0xa0,0x82,0xa2,0x81,0x42]); // あい。
r("SJISをUTF-8で読む", new TextDecoder("utf-8").decode(sj));
// 6 読み上げ
r("お手本 aria-hidden", d.getElementById("genko").getAttribute("aria-hidden")+" / 代わりの文: "+(d.querySelector(".sr")?"あり":"なし"));
// 7 消す確認
r("消すボタンに確認", /confirm|本当に/.test(html)?"あり":"なし");
// 8 お手本より長い入力
const ta=d.getElementById("typing");ta.value="王様は、人を殺します。ああ";ta.dispatchEvent(new w.Event("input"));
r("長すぎる入力の案内", JSON.stringify(d.getElementById("live").textContent));
// 9 大量取り込み
const big=Array.from({length:3000},(_,i)=>"これは"+i+"番目の文です。").join("\n\n");
let t0=Date.now(); const items=L.parseMarkdown(big,"大量",80); r("3000段落の取り込み", items.length+"題 "+(Date.now()-t0)+"ms 上限なし");
// 10 結果の記録・日付・書き出し
r("結果の書き出し", /csv|export|書き出/i.test(html.split("<script>")[1])?"あり":"なし");
// 11 音の既定
r("音の既定", JSON.stringify(d.getElementById("sound").textContent));
// 12 はじめての案内
r("はじめての案内", /はじめて|遊び方/.test(html)?"あり":"なし");
// 13 ダイアログのフォーカス閉じ込め
r("フォーカスの閉じ込め", /focusTrap|trap/.test(html)?"あり":"なし");
// 14 難易度順
r("棚の並び", [...d.querySelectorAll("#shelf .m")].slice(0,3).map(e=>e.textContent.split("・")[1].trim()).join(","));
process.exit(0);
