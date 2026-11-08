import sys, pathlib
from playwright.sync_api import sync_playwright
f = sorted(pathlib.Path("dist").glob("usausa-shakyo-dojo_v*.html"))[-1].resolve().as_uri()
out = pathlib.Path(sys.argv[1]); out.mkdir(exist_ok=True)
errs, notes = [], []
TEXT = "王様は、人を殺します。"
with sync_playwright() as p:
    b = p.chromium.launch()
    for w, h, scheme in [(1280, 820, "light"), (390, 844, "light"), (390, 844, "dark"), (768, 1000, "light")]:
        ctx = b.new_context(viewport={"width": w, "height": h}, color_scheme=scheme, accept_downloads=True)
        pg = ctx.new_page()
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(f)
        lay = pg.evaluate("document.body.dataset.layout")
        notes.append(f"{w}px 自動レイアウト={lay}")
        for skin in ["classic", "dot", "night"]:
            pg.select_option("#skin", skin)
            pg.click("#main-btn")
            pg.keyboard.type("王様は、人を殺")
            sw = pg.evaluate("document.documentElement.scrollWidth")
            if sw > w: errs.append(f"{skin} {w}px {scheme}: 横はみ出し {sw}")
            pg.screenshot(path=str(out / f"{skin}_{w}_{scheme}.png"))
            pg.keyboard.press("Escape")
        # 手動切りかえ
        for lay in ["phone", "pc"]:
            pg.click("#lay-" + lay)
            sw = pg.evaluate("document.documentElement.scrollWidth")
            if sw > w: errs.append(f"layout {lay} at {w}px: 横はみ出し {sw}")
            if w == 1280: pg.screenshot(path=str(out / f"manual_{lay}_{w}.png"))
        pg.click("#lay-pc" if w >= 821 else "#lay-phone")
        # 文の数 5文：ページをまたいで写す
        pg.click('#mode-box [data-mode="sent"]'); pg.select_option("#mode-n", "5")
        pg.click("#main-btn")
        for _ in range(10):
            if pg.is_visible("#result"): break
            txt = pg.evaluate("Array.from(document.querySelectorAll('#genko span')).map(s=>s.textContent).join('')")
            pg.keyboard.type(txt); pg.wait_for_timeout(150)
        if not pg.is_visible("#result"): errs.append(f"{w}: 5文が終わらない")
        else: notes.append(f"{w}px 5文 → " + pg.inner_text("#res-when"))
        pg.screenshot(path=str(out / f"mode5_{w}_{scheme}.png"))
        pg.keyboard.press("Escape")
        pg.click('#mode-box [data-mode="time"]')
        pg.screenshot(path=str(out / f"modetime_{w}_{scheme}.png"))
        pg.click('#mode-box [data-mode="one"]')
        # 写し終え → 結果 → 書き出し（本物のダウンロード）
        pg.click("#main-btn"); pg.keyboard.type(TEXT); pg.wait_for_timeout(400)
        if pg.is_hidden("#result"): errs.append(f"{w}: 結果が出ない")
        pg.screenshot(path=str(out / f"result_{w}_{scheme}.png"))
        with pg.expect_download() as dl:
            pg.click("#res-save")
        d = dl.value; path = out / d.suggested_filename; d.save_as(str(path))
        body = path.read_bytes()
        if not body.startswith(b"\xef\xbb\xbf") or "走れメロス".encode() not in body or "完了".encode() not in body: errs.append("CSV の中身がおかしい")
        notes.append(f"{w}px 保存 {d.suggested_filename} {len(body)}B")
        pg.keyboard.press("Escape")
        ctx.close()
    # キーボードだけで1題（Tab で開始ボタンへ → Enter → 打つ）
    pg = b.new_page(viewport={"width": 1280, "height": 820}); pg.on("pageerror", lambda e: errs.append(str(e))); pg.goto(f)
    for _ in range(30):
        pg.keyboard.press("Tab")
        if pg.evaluate("document.activeElement.id") == "main-btn": break
    pg.keyboard.press("Enter"); pg.keyboard.type(TEXT); pg.wait_for_timeout(300)
    notes.append("キーボードだけで写し終え=" + str(pg.is_visible("#result")) + " / 結果のフォーカス=" + pg.evaluate("document.activeElement.id"))
    pg.keyboard.press("Tab"); pg.keyboard.press("Tab"); pg.keyboard.press("Tab"); pg.keyboard.press("Tab")
    notes.append("Tab で結果の外へ出ない=" + str(pg.evaluate("!!document.activeElement.closest('#result')")))
    b.close()
print("\n".join(notes)); print("errors:", errs or "none")
