# [睡蓮の池](https://ruby-mc-cmd.github.io/suiren-no-ike/)

Three.js (r170) で作った、日本庭園の小さな池です。鯉十二尾、睡蓮、アマガエル五匹、アメンボがいます。画像ファイルも音声ファイルも使わず、HTML 1枚で動きます。

## 開き方

**https://ruby-mc-cmd.github.io/suiren-no-ike/** で動きます（GitHub Pages）。手元で見るなら `docs/index.html` をブラウザで開きます。どちらも three.js を CDN（jsdelivr）から読み込むので、ネット接続が必要です。

- **視点**：池（全体）／カエル（1匹を追う）／水面
- **光**：朝・昼・夕。睡蓮は朝と夕方には閉じぎみになります
- **音**：ボタンでオン・オフ、スライダーで音量
- 水面をタップすると、餌が一粒ずつ落ちます

## 中身

| パス | 内容 |
| --- | --- |
| `src/main.js` | シーンのすべて（水・光・鯉・カエル・アメンボ・植物・音・UI） |
| `src/head.html` | 画面の文字、ボタン、説明パネル（「仕組み」）、CSS |
| `build.py` | 2つを1枚にまとめて `dist/` に書き出す |
| `docs/index.html` | そのまま開ける完成版（GitHub Pages で公開しているページ） |
| `dist/pond.html` | Claude のアーティファクト用（doctype や head のない本体だけ） |
| `test.py` | ヘッドレス Chromium で動かして撮影・検証するハーネス |
| `tests/*.js` | 挙動の回帰テスト（泳ぎ、植生、鯉の採食、カエルの狩り、12分の長時間実行） |

## 主な仕組み

- **水面**：GPU で波動方程式を解き、波紋・反射・屈折・コースティクスを描きます。浮き葉の下の影や、アメンボの脚が水面につくるくぼみのレンズ影も含みます
- **鯉**：群れで泳ぎ、餌や浮草を食べます。速く泳ぐと水をかく音がします
- **カエル**：SDF のレイマーチで描いています。跳ぶ、泳ぐ、葉に上がる、鳴く、瞬きをします。アメンボを舌で捕ったり、飛びかかったりもします
- **アメンボ**：14〜34秒ごとに飛来し、最大4匹。2〜4分ほど水面にいて、また飛び去ります
- **植物**：睡蓮、ハス、ヒシ、浮草、水草、ガマ、ススキ、彼岸花、ツワブキ、サザンカ、シダ、枝垂れ柳、散り紅葉。風、とくに突風に揺れます
- **音**：Web Audio で合成しています。風、水、虫、鳥、カエルの声、着水、泳ぐ音など。カメラからの距離と左右の位置で聞こえ方が変わります

## ビルドとテスト

```sh
python3 build.py                     # src/ → dist/pond.html, docs/index.html

# テストには Playwright と、three.js のローカルコピーが必要
pip install playwright && playwright install chromium
curl -o three.module.min.js https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js
python3 tests/run.py                 # tests/*.js をすべて実行し、結果を tests/out/ に保存
python3 test.py --script '[["step",30],["canvas","shots/a.png"]]'   # 30フレーム描いて撮影
```

ページは `window.__pond` にデバッグ用の API を出しています。`tick(n)`（描画なしで n フレーム進める）、`step(n)`（描画あり）、`cmd(name, ...)`（視点やテスト用の配置）、`dbg` / `dbg_str` / `dbg_veg`（内部状態）などです。

## よく触る値

- アメンボ：`STR_MAX`（同時に何匹まで。4より大きくすると、5匹目以降は影が出ません）、`strSpawnT`（最初の飛来までの秒数）、`updateStriders` の `rr(14, 34)`（飛来の間隔）、`strNew` の `stay: rr(110, 240)`（水面にいる秒数）
- カエル：`FROG_SCALE` と、各カエルの `size`（`[1.0, 1.5, 1.07, 2.0, 1.03]`）
- カエルの狩り：`FROG_REACH`（舌の届く距離）、`frogHuntSit`（気づく距離、飛びかかる距離）、`fullT`（食べたあと満腹でいる秒数）
